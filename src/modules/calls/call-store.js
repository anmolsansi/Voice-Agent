const { randomUUID } = require('crypto');

const {
  createPersistenceError,
  isMemoryFallbackAllowed,
  query,
} = require('../../lib/db/postgres');

const TRANSCRIPT_STATUSES = new Set(['unavailable', 'delayed', 'empty', 'partial', 'complete', 'deleted']);
const SPEAKERS = new Set(['patient', 'agent', 'system', 'unknown']);

class InMemoryCallDetailStore {
  constructor() {
    this.calls = new Map();
    this.publicIdIndex = new Map();
    this.events = new Map();
    this.turns = new Map();
    this.recordings = new Map();
    this.auditLogs = new Map();
  }

  saveCall(call) {
    const saved = clone(call);
    this.calls.set(saved.id, saved);
    this.publicIdIndex.set(saved.publicCallId, saved.id);
    return clone(saved);
  }

  getCallByPublicId(publicCallId) {
    const callId = this.publicIdIndex.get(publicCallId);
    return callId ? clone(this.calls.get(callId)) : null;
  }

  saveEvent(event) {
    const collection = this.events.get(event.callId) || [];
    const duplicateIndex = event.providerEventId
      ? collection.findIndex(
          (candidate) =>
            candidate.source === event.source && candidate.providerEventId === event.providerEventId,
        )
      : -1;

    if (duplicateIndex >= 0) {
      collection[duplicateIndex] = clone({ ...collection[duplicateIndex], ...event });
    } else {
      collection.push(clone(event));
    }

    this.events.set(event.callId, collection);
    return clone(duplicateIndex >= 0 ? collection[duplicateIndex] : event);
  }

  saveTranscriptTurn(turn) {
    const collection = this.turns.get(turn.callId) || [];
    const duplicateIndex = collection.findIndex((candidate) => candidate.id === turn.id);

    if (duplicateIndex >= 0) {
      collection[duplicateIndex] = clone({ ...collection[duplicateIndex], ...turn });
    } else {
      collection.push(clone(turn));
    }

    this.turns.set(turn.callId, collection);
    return clone(duplicateIndex >= 0 ? collection[duplicateIndex] : turn);
  }

  saveRecording(recording) {
    const collection = this.recordings.get(recording.callId) || [];
    const duplicateIndex = recording.providerRecordingId
      ? collection.findIndex(
          (candidate) => candidate.providerRecordingId === recording.providerRecordingId,
        )
      : -1;

    if (duplicateIndex >= 0) {
      collection[duplicateIndex] = clone({ ...collection[duplicateIndex], ...recording });
    } else {
      collection.push(clone(recording));
    }

    this.recordings.set(recording.callId, collection);
    return clone(duplicateIndex >= 0 ? collection[duplicateIndex] : recording);
  }

  saveAuditLog(auditLog) {
    const collection = this.auditLogs.get(auditLog.callId) || [];
    collection.push(clone(auditLog));
    this.auditLogs.set(auditLog.callId, collection);
    return clone(auditLog);
  }

  getDetail(callId) {
    const call = this.calls.get(callId);
    if (!call) {
      return null;
    }

    return {
      call: clone(call),
      events: sortTimeline(this.events.get(callId) || []),
      transcriptTurns: sortTimeline(this.turns.get(callId) || []),
      recordings: sortTimeline(this.recordings.get(callId) || []),
      auditLogs: sortTimeline(this.auditLogs.get(callId) || []),
    };
  }

  clear() {
    this.calls.clear();
    this.publicIdIndex.clear();
    this.events.clear();
    this.turns.clear();
    this.recordings.clear();
    this.auditLogs.clear();
  }
}

class CallDetailStore {
  constructor() {
    this.memory = new InMemoryCallDetailStore();
  }

  canUseMemoryFallback() {
    return isMemoryFallbackAllowed();
  }

  handlePersistenceError(error) {
    if (this.canUseMemoryFallback()) {
      return;
    }

    throw createPersistenceError('Persistence is unavailable in this environment.', error.code || error.reason || 'DATABASE_UNAVAILABLE');
  }

  async saveCall(call) {
    try {
      const result = await query(
        `insert into calls (
          id,
          public_call_id,
          intake_session_id,
          provider,
          provider_call_id,
          direction,
          status,
          transcript_status,
          transcript_unavailable_reason,
          started_at,
          ended_at,
          outcome,
          metadata
        ) values ($1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10::timestamptz, $11::timestamptz, $12::jsonb, $13::jsonb)
        on conflict (public_call_id) do update set
          intake_session_id = excluded.intake_session_id,
          provider = excluded.provider,
          provider_call_id = excluded.provider_call_id,
          direction = excluded.direction,
          status = excluded.status,
          transcript_status = excluded.transcript_status,
          transcript_unavailable_reason = excluded.transcript_unavailable_reason,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at,
          outcome = excluded.outcome,
          metadata = excluded.metadata,
          updated_at = current_timestamp
        returning id, public_call_id, intake_session_id, provider, provider_call_id, direction, status, transcript_status, transcript_unavailable_reason, started_at, ended_at, outcome, metadata, created_at, updated_at`,
        [
          call.id,
          call.publicCallId,
          call.intakeSessionId,
          call.provider,
          call.providerCallId,
          call.direction,
          call.status,
          call.transcriptStatus,
          call.transcriptUnavailableReason,
          call.startedAt,
          call.endedAt,
          JSON.stringify(call.outcome || {}),
          JSON.stringify(call.metadata || {}),
        ],
      );
      const saved = mapCallRow(result.rows[0]);
      this.memory.saveCall(saved);
      return saved;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveCall(call);
    }
  }

  async saveEvent(event) {
    try {
      const result = await query(
        `insert into call_events (
          id,
          call_id,
          event_type,
          source,
          sequence,
          occurred_at,
          provider_event_id,
          raw_payload_ref,
          metadata
        ) values ($1, $2::uuid, $3, $4, $5, $6::timestamptz, $7, $8, $9::jsonb)
        on conflict (call_id, source, provider_event_id) do update set
          event_type = excluded.event_type,
          sequence = excluded.sequence,
          occurred_at = excluded.occurred_at,
          raw_payload_ref = excluded.raw_payload_ref,
          metadata = excluded.metadata
        returning id, call_id, event_type, source, sequence, occurred_at, provider_event_id, raw_payload_ref, metadata, created_at`,
        [
          event.id,
          event.callId,
          event.eventType,
          event.source,
          event.sequence,
          event.occurredAt,
          event.providerEventId,
          event.rawPayloadRef,
          JSON.stringify(event.metadata || {}),
        ],
      );
      const saved = mapEventRow(result.rows[0]);
      this.memory.saveEvent(saved);
      return saved;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveEvent(event);
    }
  }

  async saveTranscriptTurn(turn) {
    try {
      const result = await query(
        `insert into transcript_turns (
          id,
          call_id,
          speaker,
          text,
          sequence,
          started_at,
          ended_at,
          confidence,
          prompt_id,
          state_id,
          is_partial,
          metadata
        ) values ($1, $2::uuid, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9, $10, $11, $12::jsonb)
        on conflict (id) do update set
          speaker = excluded.speaker,
          text = excluded.text,
          sequence = excluded.sequence,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at,
          confidence = excluded.confidence,
          prompt_id = excluded.prompt_id,
          state_id = excluded.state_id,
          is_partial = excluded.is_partial,
          metadata = excluded.metadata
        returning id, call_id, speaker, text, sequence, started_at, ended_at, confidence, prompt_id, state_id, is_partial, metadata, created_at`,
        [
          turn.id,
          turn.callId,
          turn.speaker,
          turn.text,
          turn.sequence,
          turn.startedAt,
          turn.endedAt,
          turn.confidence,
          turn.promptId,
          turn.stateId,
          turn.isPartial,
          JSON.stringify(turn.metadata || {}),
        ],
      );
      const saved = mapTranscriptTurnRow(result.rows[0]);
      this.memory.saveTranscriptTurn(saved);
      return saved;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveTranscriptTurn(turn);
    }
  }

  async saveRecording(recording) {
    try {
      const result = await query(
        `insert into recording_metadata (
          id,
          call_id,
          provider_recording_id,
          status,
          url,
          url_stored,
          duration_seconds,
          format,
          metadata
        ) values ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9::jsonb)
        on conflict (call_id, provider_recording_id) do update set
          status = excluded.status,
          url = excluded.url,
          url_stored = excluded.url_stored,
          duration_seconds = excluded.duration_seconds,
          format = excluded.format,
          metadata = excluded.metadata
        returning id, call_id, provider_recording_id, status, url, url_stored, duration_seconds, format, metadata, created_at`,
        [
          recording.id,
          recording.callId,
          recording.providerRecordingId,
          recording.status,
          recording.url,
          recording.urlStored,
          recording.durationSeconds,
          recording.format,
          JSON.stringify(recording.metadata || {}),
        ],
      );
      const saved = mapRecordingRow(result.rows[0]);
      this.memory.saveRecording(saved);
      return saved;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveRecording(recording);
    }
  }

  async saveAuditLog(auditLog) {
    try {
      const result = await query(
        `insert into call_audit_logs (
          id,
          call_id,
          actor_type,
          actor_id,
          action,
          entity_type,
          entity_id,
          metadata,
          created_at
        ) values ($1, $2::uuid, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamptz)
        returning id, call_id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at`,
        [
          auditLog.id,
          auditLog.callId,
          auditLog.actorType,
          auditLog.actorId,
          auditLog.action,
          auditLog.entityType,
          auditLog.entityId,
          JSON.stringify(auditLog.metadata || {}),
          auditLog.createdAt,
        ],
      );
      const saved = mapAuditLogRow(result.rows[0]);
      this.memory.saveAuditLog(saved);
      return saved;
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.saveAuditLog(auditLog);
    }
  }

  async getDetailByPublicCallId(publicCallId) {
    try {
      const callResult = await query(
        `select id, public_call_id, intake_session_id, provider, provider_call_id, direction, status, transcript_status, transcript_unavailable_reason, started_at, ended_at, outcome, metadata, created_at, updated_at
         from calls
         where public_call_id = $1`,
        [publicCallId],
      );

      if (!callResult.rows[0]) {
        return this.memory.getCallByPublicId(publicCallId)
          ? this.memory.getDetail(this.memory.getCallByPublicId(publicCallId).id)
          : null;
      }

      const call = mapCallRow(callResult.rows[0]);
      this.memory.saveCall(call);

      const [eventsResult, turnsResult, recordingsResult, auditResult] = await Promise.all([
        query(
          `select id, call_id, event_type, source, sequence, occurred_at, provider_event_id, raw_payload_ref, metadata, created_at
           from call_events
           where call_id = $1
           order by occurred_at asc, sequence asc, created_at asc`,
          [call.id],
        ),
        query(
          `select id, call_id, speaker, text, sequence, started_at, ended_at, confidence, prompt_id, state_id, is_partial, metadata, created_at
           from transcript_turns
           where call_id = $1
           order by started_at asc nulls last, sequence asc, created_at asc`,
          [call.id],
        ),
        query(
          `select id, call_id, provider_recording_id, status, url, url_stored, duration_seconds, format, metadata, created_at
           from recording_metadata
           where call_id = $1
           order by created_at asc`,
          [call.id],
        ),
        query(
          `select id, call_id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at
           from call_audit_logs
           where call_id = $1
           order by created_at asc`,
          [call.id],
        ),
      ]);

      return {
        call,
        events: eventsResult.rows.map(mapEventRow),
        transcriptTurns: turnsResult.rows.map(mapTranscriptTurnRow),
        recordings: recordingsResult.rows.map(mapRecordingRow),
        auditLogs: auditResult.rows.map(mapAuditLogRow),
      };
    } catch (error) {
      this.handlePersistenceError(error);
      const call = this.memory.getCallByPublicId(publicCallId);
      return call ? this.memory.getDetail(call.id) : null;
    }
  }

  async clearAll() {
    this.memory.clear();

    try {
      await query('truncate table call_audit_logs, recording_metadata, transcript_turns, call_events, calls restart identity cascade');
    } catch (_error) {
      // Ignore in tests and local fallback mode.
    }
  }
}

function normalizeCall(input = {}) {
  const now = new Date().toISOString();
  const transcriptStatus = TRANSCRIPT_STATUSES.has(input.transcriptStatus)
    ? input.transcriptStatus
    : 'unavailable';

  return {
    id: input.id || randomUUID(),
    publicCallId: normalizeRequiredText(input.publicCallId, 'publicCallId'),
    intakeSessionId: normalizeOptionalText(input.intakeSessionId),
    provider: normalizeOptionalText(input.provider) || 'unknown',
    providerCallId: normalizeOptionalText(input.providerCallId),
    direction: normalizeOptionalText(input.direction) || 'outbound',
    status: normalizeOptionalText(input.status) || 'created',
    transcriptStatus,
    transcriptUnavailableReason: normalizeOptionalText(input.transcriptUnavailableReason),
    startedAt: normalizeTimestamp(input.startedAt) || now,
    endedAt: normalizeTimestamp(input.endedAt),
    outcome: input.outcome && typeof input.outcome === 'object' ? input.outcome : {},
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeEvent(input = {}, callId, index = 0) {
  const occurredAt = normalizeTimestamp(input.occurredAt || input.timestamp) || new Date().toISOString();

  return {
    id: input.id || randomUUID(),
    callId,
    eventType: normalizeEventName(input.eventType || input.type || input.name),
    source: normalizeOptionalText(input.source) || 'system',
    sequence: Number.isInteger(input.sequence) ? input.sequence : index,
    occurredAt,
    providerEventId: normalizeOptionalText(input.providerEventId),
    rawPayloadRef: normalizeOptionalText(input.rawPayloadRef),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    createdAt: input.createdAt || occurredAt,
  };
}

function normalizeTranscriptTurn(input = {}, callId, index = 0) {
  const speaker = SPEAKERS.has(input.speaker) ? input.speaker : 'unknown';
  const startedAt = normalizeTimestamp(input.startedAt || input.timestamp);

  return {
    id: input.id || randomUUID(),
    callId,
    speaker,
    text: typeof input.text === 'string' ? input.text : '',
    sequence: Number.isInteger(input.sequence) ? input.sequence : index,
    startedAt,
    endedAt: normalizeTimestamp(input.endedAt),
    confidence: typeof input.confidence === 'number' ? input.confidence : null,
    promptId: normalizeOptionalText(input.promptId),
    stateId: normalizeOptionalText(input.stateId),
    isPartial: Boolean(input.isPartial),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    createdAt: input.createdAt || startedAt || new Date().toISOString(),
  };
}

function normalizeRecording(input = {}, callId, policy = {}) {
  const providerAllowsUrlStorage = input.providerAllowsUrlStorage !== false && policy.providerAllowsUrlStorage !== false;
  const allowUrlStorage = Boolean(policy.allowRecordingUrlStorage && providerAllowsUrlStorage);
  const url = allowUrlStorage ? normalizeOptionalText(input.url) : null;

  return {
    id: input.id || randomUUID(),
    callId,
    providerRecordingId: normalizeOptionalText(input.providerRecordingId) || randomUUID(),
    status: normalizeOptionalText(input.status) || (url ? 'available' : 'unavailable'),
    url,
    urlStored: Boolean(url),
    durationSeconds: typeof input.durationSeconds === 'number' ? input.durationSeconds : null,
    format: normalizeOptionalText(input.format),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function normalizeAuditLog(input = {}, callId, index = 0) {
  return {
    id: input.id || randomUUID(),
    callId,
    actorType: normalizeOptionalText(input.actorType) || 'system',
    actorId: normalizeOptionalText(input.actorId),
    action: normalizeEventName(input.action || `call_detail_update_${index}`),
    entityType: normalizeOptionalText(input.entityType) || 'call',
    entityId: normalizeOptionalText(input.entityId) || callId,
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    createdAt: normalizeTimestamp(input.createdAt) || new Date().toISOString(),
  };
}

function buildCallDetailContract(detail) {
  if (!detail) {
    return null;
  }

  const recordings = detail.recordings || [];
  const recording = recordings[0] || null;
  const transcriptTurns = sortTimeline(detail.transcriptTurns || []);
  const transcriptStatus = deriveTranscriptStatus(detail.call.transcriptStatus, transcriptTurns);

  return {
    call: detail.call,
    timeline: sortTimeline(detail.events || []),
    transcript: {
      status: transcriptStatus,
      isDelayed: transcriptStatus === 'delayed',
      unavailableReason: detail.call.transcriptUnavailableReason,
      turns: transcriptTurns,
    },
    outcome: detail.call.outcome || {},
    recording: recording
      ? {
          available: recording.status === 'available',
          status: recording.status,
          url: recording.url,
          urlStored: recording.urlStored,
          durationSeconds: recording.durationSeconds,
          format: recording.format,
          metadata: recording.metadata,
        }
      : {
          available: false,
          status: 'unavailable',
          url: null,
          urlStored: false,
          durationSeconds: null,
          format: null,
          metadata: {},
        },
    auditLogs: sortTimeline(detail.auditLogs || []),
  };
}

function deriveTranscriptStatus(status, turns) {
  if (status === 'complete' && turns.length === 0) {
    return 'empty';
  }

  return status;
}

function normalizeEventName(value) {
  const normalized = normalizeOptionalText(value)
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'unknown';
}

function normalizeRequiredText(value, fieldName) {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    const error = new Error(`${fieldName} is required.`);
    error.code = 'INVALID_CALL_DETAIL';
    throw error;
  }

  return normalized;
}

function normalizeOptionalText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sortTimeline(items) {
  return clone(items).sort((left, right) => {
    const leftTime = new Date(left.occurredAt || left.startedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.occurredAt || right.startedAt || right.createdAt || 0).getTime();

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return (left.sequence || 0) - (right.sequence || 0);
  });
}

function mapCallRow(row) {
  return {
    id: row.id,
    publicCallId: row.public_call_id,
    intakeSessionId: row.intake_session_id,
    provider: row.provider,
    providerCallId: row.provider_call_id,
    direction: row.direction,
    status: row.status,
    transcriptStatus: row.transcript_status,
    transcriptUnavailableReason: row.transcript_unavailable_reason,
    startedAt: toIso(row.started_at),
    endedAt: toIso(row.ended_at),
    outcome: row.outcome || {},
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapEventRow(row) {
  return {
    id: row.id,
    callId: row.call_id,
    eventType: row.event_type,
    source: row.source,
    sequence: row.sequence,
    occurredAt: toIso(row.occurred_at),
    providerEventId: row.provider_event_id,
    rawPayloadRef: row.raw_payload_ref,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
  };
}

function mapTranscriptTurnRow(row) {
  return {
    id: row.id,
    callId: row.call_id,
    speaker: row.speaker,
    text: row.text,
    sequence: row.sequence,
    startedAt: toIso(row.started_at),
    endedAt: toIso(row.ended_at),
    confidence: row.confidence === null ? null : Number(row.confidence),
    promptId: row.prompt_id,
    stateId: row.state_id,
    isPartial: row.is_partial,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
  };
}

function mapRecordingRow(row) {
  return {
    id: row.id,
    callId: row.call_id,
    providerRecordingId: row.provider_recording_id,
    status: row.status,
    url: row.url,
    urlStored: row.url_stored,
    durationSeconds: row.duration_seconds === null ? null : Number(row.duration_seconds),
    format: row.format,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
  };
}

function mapAuditLogRow(row) {
  return {
    id: row.id,
    callId: row.call_id,
    actorType: row.actor_type,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
  };
}

function toIso(value) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const callDetailStore = new CallDetailStore();

module.exports = {
  CallDetailStore,
  InMemoryCallDetailStore,
  buildCallDetailContract,
  callDetailStore,
  normalizeAuditLog,
  normalizeCall,
  normalizeEvent,
  normalizeRecording,
  normalizeTranscriptTurn,
};
