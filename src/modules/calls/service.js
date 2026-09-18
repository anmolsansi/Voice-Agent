const { query, transaction } = require('../../lib/db/postgres');
const { fail, objectInput, uuid } = require('../../http/errors');
const { isDeepStrictEqual } = require('node:util');
const crypto = require('crypto');
const { callStore } = require('./store');

const CALL_STATUSES = ['queued', 'starting', 'in_progress', 'completed', 'failed', 'canceled', 'finalizing'];
const TRANSCRIPT_STATUSES = ['not_started', 'pending', 'ready', 'failed'];
const TERMINAL_STATUSES = ['completed', 'failed', 'canceled'];

function createUiError(code, message, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.status = code === 'VALIDATION_ERROR' ? 400 : code === 'CALL_NOT_FOUND' ? 404 : code === 'INVALID_STATUS_TRANSITION' ? 409 : 500;
  return error;
}

function getHttpStatus(error) {
  if (error.status) return error.status;
  if (error.code === 'PERSISTENCE_UNAVAILABLE') return 503;
  if (error.code === 'VALIDATION_ERROR') return 400;
  if (error.code === 'CALL_NOT_FOUND') return 404;
  if (error.code === 'INVALID_STATUS_TRANSITION') return 409;
  return 500;
}

function serializeError(error, fallbackMessage) {
  return {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || fallbackMessage,
      details: error.details || null,
    },
  };
}

async function createCallAttempt(payload = {}, options = {}) {
  objectInput(payload, ['patientId', 'scheduleId', 'idempotencyKey', 'dueAt', 'metadata']);
  uuid(payload.patientId); uuid(payload.scheduleId);
  const key = payload.idempotencyKey || options.idempotencyKey;
  if (typeof key !== 'string' || !key.trim() || key.length > 200) throw fail(400, 'VALIDATION_ERROR', 'idempotencyKey is required (maximum 200 characters).');
  if (payload.dueAt !== undefined && (typeof payload.dueAt !== 'string' || !Number.isFinite(Date.parse(payload.dueAt)))) throw fail(400, 'VALIDATION_ERROR', 'dueAt must be a timestamp.');
  if (payload.metadata !== undefined) objectInput(payload.metadata, ['source', 'dueAt', 'timezone', 'retryCount']);
  const input = { patientId: payload.patientId.toLowerCase(), scheduleId: payload.scheduleId.toLowerCase(), dueAt: payload.dueAt || null, metadata: payload.metadata || {} };
  return transaction(async () => {
    await query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [key]);
    const { rows: [existing] } = await query('SELECT id,creation_input FROM call_attempts WHERE idempotency_key=$1', [key]);
    if (existing) {
      if (!isDeepStrictEqual(existing.creation_input, input)) throw fail(409, 'IDEMPOTENCY_CONFLICT', 'Idempotency key has different inputs.');
      return { call: serializeCall(await callStore.getCall(existing.id)), created: false };
    }
    const { rows: [schedule] } = await query('SELECT * FROM checkin_schedules WHERE id=$1 FOR UPDATE', [input.scheduleId]);
    if (!schedule || schedule.patient_id !== input.patientId) throw fail(400, 'INVALID_SCHEDULE', 'Schedule must belong to the patient.');
    if (schedule.status !== 'active') throw fail(409, 'SCHEDULE_INACTIVE', 'Schedule is not active.');
    const now = options.now || new Date().toISOString();
    const call = {
      id: crypto.randomUUID(), patientId: input.patientId, scheduleId: input.scheduleId,
      status: 'queued', attemptNumber: await callStore.getNextAttemptNumber(input.patientId, input.scheduleId),
      providerIds: normalizeProviderIds(), transcriptStatus: 'not_started', outcome: null, escalationFlag: false,
      idempotencyKey: key, createdAt: now, queuedAt: now, startedAt: null, endedAt: null, canceledAt: null,
      errorDetails: null, outcomeSummary: null, metadata: input.metadata, updatedAt: now,
    };
    await callStore.createCall(call);
    await query('UPDATE call_attempts SET creation_input=$1 WHERE id=$2', [input, call.id]);
    await recordCallAudit(call.id, 'call.created', { status: call.status }, options.actor || { type: 'system' }, now);
    return { call: serializeCall(call), created: true };
  });
}

async function listCalls(filters = {}) {
  objectInput(filters, ['patientId','scheduleId','status']);
  if (filters.patientId) uuid(filters.patientId);
  if (filters.scheduleId) uuid(filters.scheduleId);
  if (filters.status) validateEnum(filters.status, CALL_STATUSES, 'status');
  const calls = await callStore.listCalls(filters);
  return calls.map(serializeCall);
}

async function getCallDetail(callId) {
  const call = await requireCall(callId);
  const auditEvents = await callStore.listAuditEvents(call.id);
  return {
    call: serializeCall(call),
    auditEvents: auditEvents.map(serializeAuditEvent),
  };
}

async function updateCallStatus(callId, payload = {}, options = {}) {
  objectInput(payload, ['status', 'providerIds', 'transcriptStatus', 'errorDetails']);
  validateEnum(payload.status, CALL_STATUSES, 'status');
  return transition(callId, payload, options, 'call.status_updated');
}

async function finalizeCall(callId, payload = {}, options = {}) {
  objectInput(payload, ['transcriptStatus', 'outcome', 'outcomeSummary', 'escalationFlag', 'errorDetails']);
  return transition(callId, { ...payload, status: payload.errorDetails ? 'failed' : 'completed' }, options, 'call.finalized');
}

async function transition(callId, payload, options, action) {
  uuid(callId);
  if (payload.providerIds !== undefined) {
    objectInput(payload.providerIds, ['callId','conversationId']);
    for (const value of Object.values(payload.providerIds)) if (value !== null && (typeof value !== 'string' || value.length > 200)) throw fail(400, 'VALIDATION_ERROR', 'Invalid provider identifier.');
  }
  if (payload.transcriptStatus !== undefined) validateEnum(payload.transcriptStatus, TRANSCRIPT_STATUSES, 'transcriptStatus');
  if (payload.escalationFlag !== undefined && typeof payload.escalationFlag !== 'boolean') throw fail(400, 'VALIDATION_ERROR', 'Invalid escalation flag.');
  for (const field of ['outcome','outcomeSummary']) if (payload[field] !== undefined && (typeof payload[field] !== 'string' || payload[field].length > 2000)) throw fail(400, 'VALIDATION_ERROR', 'Invalid outcome.');
  if (payload.errorDetails !== undefined && payload.errorDetails !== null) objectInput(payload.errorDetails, ['code','message','retryable','providerStatus','details']);
  return transaction(async () => {
    const { rows: [locked] } = await query('SELECT last_transition FROM call_attempts WHERE id=$1 FOR UPDATE', [callId]);
    if (!locked) throw fail(404, 'CALL_NOT_FOUND', 'Call attempt was not found.');
    const call = await callStore.getCall(callId);
    if (call.status === payload.status) {
      if (isDeepStrictEqual(locked.last_transition, { action, payload })) return serializeCall(call);
      throw fail(409, 'INVALID_STATUS_TRANSITION', 'Only an identical transition replay is allowed.');
    }
    assertTransition(call.status, payload.status);
    const now = options.now || new Date().toISOString();
    const updated = { ...call, ...payload, updatedAt: now,
      providerIds: { ...call.providerIds, ...(payload.providerIds || {}) } };
    if (['starting','in_progress'].includes(updated.status)) updated.startedAt = call.startedAt || now;
    if (TERMINAL_STATUSES.includes(updated.status)) updated.endedAt = call.endedAt || now;
    if (updated.status === 'canceled') updated.canceledAt = now;
    validateCall(updated);
    await callStore.saveCall(updated);
    await query('UPDATE call_attempts SET last_transition=$1 WHERE id=$2', [{ action, payload }, callId]);
    await recordCallAudit(callId, action, { previousStatus: call.status, status: updated.status }, options.actor || { type: 'system' }, now);
    return serializeCall(updated);
  });
}

async function seedSchedule(payload = {}, options = {}) {
  validateRequired(payload.patientId, 'patientId');
  validateRequired(payload.nextDueAt, 'nextDueAt');
  const now = options.now || new Date().toISOString();
  return callStore.saveSchedule({
    id: payload.id || crypto.randomUUID(),
    patientId: String(payload.patientId),
    status: payload.status || 'active',
    timezone: payload.timezone || 'UTC',
    nextDueAt: new Date(payload.nextDueAt).toISOString(),
    retryCount: Number(payload.retryCount || 0),
    metadata: payload.metadata || {},
    createdAt: payload.createdAt || now,
    updatedAt: now,
  });
}

async function listEligibleSchedules(nowIso) {
  return callStore.listEligibleSchedules(nowIso);
}

async function recordCallAudit(callId, action, metadata, actor, now) {
  return callStore.appendAuditEvent({
    id: crypto.randomUUID(),
    actorType: actor.type || 'system',
    actorId: actor.id || null,
    action,
    entityType: 'call_attempt',
    entityId: callId,
    metadata,
    createdAt: now || new Date().toISOString(),
  });
}

async function requireCall(callId) {
  uuid(callId);
  const call = await callStore.getCall(callId);
  if (!call) {
    throw createUiError('CALL_NOT_FOUND', 'Call attempt was not found.', { callId });
  }
  return call;
}

function validateCall(call) {
  validateEnum(call.status, CALL_STATUSES, 'status');
  validateEnum(call.transcriptStatus, TRANSCRIPT_STATUSES, 'transcriptStatus');
  if (!Number.isInteger(call.attemptNumber) || call.attemptNumber < 1) {
    throw createUiError('VALIDATION_ERROR', 'attemptNumber must be a positive integer.', { field: 'attemptNumber' });
  }
}

function validateRequired(value, field) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw createUiError('VALIDATION_ERROR', `${field} is required.`, { field });
  }
}

function validateEnum(value, allowedValues, field) {
  if (!allowedValues.includes(value)) {
    throw createUiError('VALIDATION_ERROR', `${field} must be one of: ${allowedValues.join(', ')}.`, {
      field,
      allowedValues,
    });
  }
}

const TRANSITIONS = {
  queued: ['starting','canceled','failed'], starting: ['in_progress','failed','canceled'],
  in_progress: ['finalizing','failed','canceled'], finalizing: ['completed','failed'],
  completed: [], failed: [], canceled: [],
};
function assertTransition(currentStatus, nextStatus) {
  if (!TRANSITIONS[currentStatus]?.includes(nextStatus)) throw fail(409, 'INVALID_STATUS_TRANSITION', 'Call state cannot transition to the requested state.');
}

function normalizeProviderIds(providerIds = {}) {
  return {
    callId: providerIds.callId || null,
    conversationId: providerIds.conversationId || null,
  };
}

function normalizeErrorDetails(errorDetails) {
  if (!errorDetails) {
    return null;
  }
  return {
    code: errorDetails.code || 'CALL_ERROR',
    message: errorDetails.message || 'Call orchestration error.',
    retryable: Boolean(errorDetails.retryable),
    providerStatus: errorDetails.providerStatus || null,
    details: errorDetails.details || null,
  };
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized || null;
}

function serializeCall(call) {
  return {
    id: call.id,
    patientId: call.patientId,
    scheduleId: call.scheduleId,
    status: call.status,
    attemptNumber: call.attemptNumber,
    providerIds: normalizeProviderIds(call.providerIds),
    transcriptStatus: call.transcriptStatus,
    outcome: call.outcome,
    outcomeSummary: call.outcomeSummary,
    escalationFlag: Boolean(call.escalationFlag),
    createdAt: call.createdAt,
    queuedAt: call.queuedAt || null,
    startedAt: call.startedAt || null,
    endedAt: call.endedAt || null,
    canceledAt: call.canceledAt || null,
    errorDetails: call.errorDetails || null,
    metadata: call.metadata || {},
  };
}

function serializeAuditEvent(event) {
  return {
    id: event.id,
    action: event.action,
    actorType: event.actorType,
    actorId: event.actorId,
    metadata: event.metadata || {},
    createdAt: event.createdAt,
  };
}

module.exports = {
  CALL_STATUSES,
  TRANSCRIPT_STATUSES,
  createCallAttempt,
  createUiError,
  finalizeCall,
  getCallDetail,
  getHttpStatus,
  listCalls,
  listEligibleSchedules,
  seedSchedule,
  serializeError,
  updateCallStatus,
};
