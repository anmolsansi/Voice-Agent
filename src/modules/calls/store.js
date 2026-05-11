const {
  createPersistenceError,
  getPool,
  isMemoryFallbackAllowed,
  query,
} = require('../../lib/db/postgres');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class InMemoryCallStore {
  constructor() {
    this.calls = new Map();
    this.idempotencyIndex = new Map();
    this.auditEvents = [];
    this.schedules = new Map();
  }

  saveCall(call) {
    const saved = clone(call);
    this.calls.set(saved.id, saved);
    if (saved.idempotencyKey) {
      this.idempotencyIndex.set(saved.idempotencyKey, saved.id);
    }
    return clone(saved);
  }

  getCall(callId) {
    const call = this.calls.get(callId);
    return call ? clone(call) : null;
  }

  getCallByIdempotencyKey(idempotencyKey) {
    const callId = this.idempotencyIndex.get(idempotencyKey);
    return callId ? this.getCall(callId) : null;
  }

  listCalls(filters = {}) {
    return Array.from(this.calls.values())
      .filter((call) => matchesFilters(call, filters))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((call) => clone(call));
  }

  getNextAttemptNumber(patientId, scheduleId) {
    return Array.from(this.calls.values()).filter(
      (call) => call.patientId === patientId && call.scheduleId === scheduleId,
    ).length + 1;
  }

  appendAuditEvent(event) {
    const saved = clone(event);
    this.auditEvents.push(saved);
    return clone(saved);
  }

  listAuditEvents(callId) {
    return this.auditEvents.filter((event) => event.entityId === callId).map((event) => clone(event));
  }

  saveSchedule(schedule) {
    const saved = clone(schedule);
    this.schedules.set(saved.id, saved);
    return clone(saved);
  }

  listEligibleSchedules(nowIso) {
    const now = Date.parse(nowIso);
    return Array.from(this.schedules.values())
      .filter((schedule) => schedule.status === 'active' && Date.parse(schedule.nextDueAt) <= now)
      .map((schedule) => clone(schedule));
  }

  clear() {
    this.calls.clear();
    this.idempotencyIndex.clear();
    this.auditEvents = [];
    this.schedules.clear();
  }
}

class CallStore {
  constructor() {
    this.memory = new InMemoryCallStore();
  }

  canUseMemoryFallback() {
    return isMemoryFallbackAllowed();
  }

  handlePersistenceError(error) {
    if (this.canUseMemoryFallback()) {
      return;
    }

    throw createPersistenceError(
      'Call orchestration persistence is unavailable in this environment.',
      error.code || error.reason || 'DATABASE_UNAVAILABLE',
    );
  }

  async saveCall(call) {
    try {
      await query(callUpsertSql(), callParams(call));
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveCall(call);
    }

    this.memory.saveCall(call);
    return clone(call);
  }

  async createCall(call) {
    const activePool = getPool();

    if (!activePool) {
      const existing = call.idempotencyKey ? this.memory.getCallByIdempotencyKey(call.idempotencyKey) : null;
      if (existing) {
        return { call: existing, created: false };
      }
      return { call: this.memory.saveCall(call), created: true };
    }

    const client = await activePool.connect();
    try {
      await client.query('begin');
      if (call.idempotencyKey) {
        const existingResult = await client.query(callSelectSql('where idempotency_key = $1'), [call.idempotencyKey]);
        if (existingResult.rows[0]) {
          await client.query('commit');
          const existing = mapCallRow(existingResult.rows[0]);
          this.memory.saveCall(existing);
          return { call: existing, created: false };
        }
      }
      await client.query(callUpsertSql(), callParams(call));
      await client.query('commit');
      this.memory.saveCall(call);
      return { call: clone(call), created: true };
    } catch (error) {
      try {
        await client.query('rollback');
      } catch (_rollbackError) {
        // Best effort rollback; the original error is more useful to callers.
      }
      this.handlePersistenceError(error);
      const existing = call.idempotencyKey ? this.memory.getCallByIdempotencyKey(call.idempotencyKey) : null;
      if (existing) {
        return { call: existing, created: false };
      }
      return { call: this.memory.saveCall(call), created: true };
    } finally {
      client.release();
    }
  }

  async getCall(callId) {
    try {
      const result = await query(callSelectSql('where id = $1'), [callId]);
      if (result.rows[0]) {
        const call = mapCallRow(result.rows[0]);
        this.memory.saveCall(call);
        return call;
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.getCall(callId);
    }

    return this.memory.getCall(callId);
  }

  async getCallByIdempotencyKey(idempotencyKey) {
    try {
      const result = await query(callSelectSql('where idempotency_key = $1'), [idempotencyKey]);
      if (result.rows[0]) {
        const call = mapCallRow(result.rows[0]);
        this.memory.saveCall(call);
        return call;
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.getCallByIdempotencyKey(idempotencyKey);
    }

    return this.memory.getCallByIdempotencyKey(idempotencyKey);
  }

  async listCalls(filters = {}) {
    const clauses = [];
    const params = [];
    addFilter(clauses, params, 'patient_id', filters.patientId);
    addFilter(clauses, params, 'schedule_id', filters.scheduleId);
    addFilter(clauses, params, 'status', filters.status);
    const where = clauses.length ? `where ${clauses.join(' and ')}` : '';

    try {
      const result = await query(`${callSelectSql(where)} order by created_at desc limit 200`, params);
      const calls = result.rows.map(mapCallRow);
      calls.forEach((call) => this.memory.saveCall(call));
      return calls;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.listCalls(filters);
    }
  }

  async getNextAttemptNumber(patientId, scheduleId) {
    try {
      const result = await query(
        'select count(*)::integer as attempt_count from call_attempts where patient_id = $1 and schedule_id = $2',
        [patientId, scheduleId],
      );
      return Number(result.rows[0]?.attempt_count || 0) + 1;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.getNextAttemptNumber(patientId, scheduleId);
    }
  }

  async appendAuditEvent(event) {
    try {
      await query(
        `insert into audit_logs (id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::timestamptz)`,
        [
          event.id,
          event.actorType,
          event.actorId || null,
          event.action,
          event.entityType,
          event.entityId,
          JSON.stringify(event.metadata || {}),
          event.createdAt,
        ],
      );
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.appendAuditEvent(event);
    }

    return this.memory.appendAuditEvent(event);
  }

  async listAuditEvents(callId) {
    try {
      const result = await query(
        `select id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at
         from audit_logs where entity_type = 'call_attempt' and entity_id = $1 order by created_at asc`,
        [callId],
      );
      return result.rows.map(mapAuditRow);
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.listAuditEvents(callId);
    }
  }

  async saveSchedule(schedule) {
    try {
      await query(
        `insert into checkin_schedules (id, patient_id, status, timezone, next_due_at, retry_count, metadata, created_at, updated_at)
         values ($1, $2, $3, $4, $5::timestamptz, $6, $7::jsonb, $8::timestamptz, $9::timestamptz)
         on conflict (id) do update set status = excluded.status, timezone = excluded.timezone,
         next_due_at = excluded.next_due_at, retry_count = excluded.retry_count, metadata = excluded.metadata,
         updated_at = excluded.updated_at`,
        [
          schedule.id,
          schedule.patientId,
          schedule.status,
          schedule.timezone || 'UTC',
          schedule.nextDueAt,
          schedule.retryCount || 0,
          JSON.stringify(schedule.metadata || {}),
          schedule.createdAt,
          schedule.updatedAt,
        ],
      );
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveSchedule(schedule);
    }

    return this.memory.saveSchedule(schedule);
  }

  async listEligibleSchedules(nowIso) {
    try {
      const result = await query(
        `select id, patient_id, status, timezone, next_due_at, retry_count, metadata, created_at, updated_at
         from checkin_schedules where status = 'active' and next_due_at <= $1::timestamptz order by next_due_at asc limit 200`,
        [nowIso],
      );
      return result.rows.map(mapScheduleRow);
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.listEligibleSchedules(nowIso);
    }
  }

  async clearAll() {
    this.memory.clear();
  }
}


function callUpsertSql() {
  return `insert into call_attempts (
    id, patient_id, schedule_id, status, attempt_number, provider_call_id,
    provider_conversation_id, transcript_status, outcome, escalation_flag,
    idempotency_key, created_at, queued_at, started_at, ended_at, canceled_at,
    error_code, error_message, error_details, outcome_summary, metadata, updated_at
  ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz, $13::timestamptz,
    $14::timestamptz, $15::timestamptz, $16::timestamptz, $17, $18, $19::jsonb, $20, $21::jsonb, $22::timestamptz)
  on conflict (id) do update set
    status = excluded.status,
    provider_call_id = excluded.provider_call_id,
    provider_conversation_id = excluded.provider_conversation_id,
    transcript_status = excluded.transcript_status,
    outcome = excluded.outcome,
    escalation_flag = excluded.escalation_flag,
    queued_at = excluded.queued_at,
    started_at = excluded.started_at,
    ended_at = excluded.ended_at,
    canceled_at = excluded.canceled_at,
    error_code = excluded.error_code,
    error_message = excluded.error_message,
    error_details = excluded.error_details,
    outcome_summary = excluded.outcome_summary,
    metadata = excluded.metadata,
    updated_at = excluded.updated_at`;
}

function callSelectSql(whereClause) {
  return `select id, patient_id, schedule_id, status, attempt_number, provider_call_id,
    provider_conversation_id, transcript_status, outcome, escalation_flag, idempotency_key,
    created_at, queued_at, started_at, ended_at, canceled_at, error_code, error_message,
    error_details, outcome_summary, metadata, updated_at from call_attempts ${whereClause}`;
}

function callParams(call) {
  return [
    call.id,
    call.patientId,
    call.scheduleId,
    call.status,
    call.attemptNumber,
    call.providerIds?.callId || null,
    call.providerIds?.conversationId || null,
    call.transcriptStatus,
    call.outcome || null,
    call.escalationFlag,
    call.idempotencyKey || null,
    call.createdAt,
    call.queuedAt || null,
    call.startedAt || null,
    call.endedAt || null,
    call.canceledAt || null,
    call.errorDetails?.code || null,
    call.errorDetails?.message || null,
    JSON.stringify(call.errorDetails || {}),
    call.outcomeSummary || null,
    JSON.stringify(call.metadata || {}),
    call.updatedAt,
  ];
}

function addFilter(clauses, params, column, value) {
  if (!value) {
    return;
  }
  params.push(value);
  clauses.push(`${column} = $${params.length}`);
}

function mapCallRow(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    scheduleId: row.schedule_id,
    status: row.status,
    attemptNumber: row.attempt_number,
    providerIds: {
      callId: row.provider_call_id,
      conversationId: row.provider_conversation_id,
    },
    transcriptStatus: row.transcript_status,
    outcome: row.outcome,
    escalationFlag: row.escalation_flag,
    idempotencyKey: row.idempotency_key,
    createdAt: toIso(row.created_at),
    queuedAt: toIso(row.queued_at),
    startedAt: toIso(row.started_at),
    endedAt: toIso(row.ended_at),
    canceledAt: toIso(row.canceled_at),
    errorDetails: row.error_details || null,
    outcomeSummary: row.outcome_summary,
    metadata: row.metadata || {},
    updatedAt: toIso(row.updated_at),
  };
}

function mapAuditRow(row) {
  return {
    id: row.id,
    actorType: row.actor_type,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
  };
}

function mapScheduleRow(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    timezone: row.timezone,
    nextDueAt: toIso(row.next_due_at),
    retryCount: row.retry_count,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function matchesFilters(call, filters) {
  return (!filters.patientId || call.patientId === filters.patientId)
    && (!filters.scheduleId || call.scheduleId === filters.scheduleId)
    && (!filters.status || call.status === filters.status);
}

function toIso(value) {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

const callStore = new CallStore();

module.exports = {
  CallStore,
  InMemoryCallStore,
  callStore,
};
