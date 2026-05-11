const crypto = require('crypto');
const { callStore } = require('./store');

const CALL_STATUSES = ['queued', 'starting', 'in_progress', 'completed', 'failed', 'canceled', 'finalizing'];
const TRANSCRIPT_STATUSES = ['not_started', 'pending', 'ready', 'failed'];
const TERMINAL_STATUSES = ['completed', 'failed', 'canceled'];

function createUiError(code, message, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function getHttpStatus(error) {
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
  validateRequired(payload.patientId, 'patientId');
  validateRequired(payload.scheduleId, 'scheduleId');

  const now = options.now || new Date().toISOString();
  const idempotencyKey = normalizeString(payload.idempotencyKey)
    || normalizeString(options.idempotencyKey)
    || `call:${payload.scheduleId}:${payload.patientId}:${payload.dueAt || now.slice(0, 10)}`;
  const existing = await callStore.getCallByIdempotencyKey(idempotencyKey);
  if (existing) {
    return { call: serializeCall(existing), created: false };
  }

  const attemptNumber = payload.attemptNumber || await callStore.getNextAttemptNumber(payload.patientId, payload.scheduleId);
  const call = {
    id: payload.id || crypto.randomUUID(),
    patientId: String(payload.patientId),
    scheduleId: String(payload.scheduleId),
    status: payload.status || 'queued',
    attemptNumber,
    providerIds: normalizeProviderIds(payload.providerIds),
    transcriptStatus: payload.transcriptStatus || 'not_started',
    outcome: payload.outcome || null,
    escalationFlag: Boolean(payload.escalationFlag),
    idempotencyKey,
    createdAt: now,
    queuedAt: payload.queuedAt || now,
    startedAt: payload.startedAt || null,
    endedAt: payload.endedAt || null,
    canceledAt: payload.canceledAt || null,
    errorDetails: payload.errorDetails || null,
    outcomeSummary: payload.outcomeSummary || null,
    metadata: payload.metadata || {},
    updatedAt: now,
  };

  validateCall(call);
  const result = await callStore.createCall(call);
  if (result.created) {
    await recordCallAudit(result.call.id, 'call.created', {
      patientId: result.call.patientId,
      scheduleId: result.call.scheduleId,
      status: result.call.status,
      idempotencyKey: result.call.idempotencyKey,
    }, options.actor || { type: 'system' }, now);
  }

  return { call: serializeCall(result.call), created: result.created };
}

async function listCalls(filters = {}) {
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
  const call = await requireCall(callId);
  const nextStatus = normalizeString(payload.status);
  validateEnum(nextStatus, CALL_STATUSES, 'status');
  assertTransition(call.status, nextStatus);

  const now = options.now || new Date().toISOString();
  const updated = {
    ...call,
    status: nextStatus,
    providerIds: normalizeProviderIds({ ...call.providerIds, ...(payload.providerIds || {}) }),
    transcriptStatus: payload.transcriptStatus || call.transcriptStatus,
    errorDetails: payload.errorDetails === undefined ? call.errorDetails : normalizeErrorDetails(payload.errorDetails),
    metadata: { ...(call.metadata || {}), ...(payload.metadata || {}) },
    startedAt: call.startedAt,
    endedAt: call.endedAt,
    canceledAt: call.canceledAt,
    updatedAt: now,
  };

  if (nextStatus === 'starting' || nextStatus === 'in_progress') {
    updated.startedAt = updated.startedAt || now;
  }
  if (nextStatus === 'completed' || nextStatus === 'failed') {
    updated.endedAt = updated.endedAt || now;
  }
  if (nextStatus === 'canceled') {
    updated.canceledAt = updated.canceledAt || now;
    updated.endedAt = updated.endedAt || now;
  }

  validateCall(updated);
  const saved = await callStore.saveCall(updated);
  await recordCallAudit(saved.id, 'call.status_updated', {
    previousStatus: call.status,
    status: saved.status,
    providerIds: saved.providerIds,
    errorDetails: saved.errorDetails,
  }, options.actor || { type: 'system' }, now);

  return serializeCall(saved);
}

async function finalizeCall(callId, payload = {}, options = {}) {
  const call = await requireCall(callId);
  if (call.status === 'canceled') {
    throw createUiError('INVALID_STATUS_TRANSITION', 'Canceled calls cannot be finalized.', { status: call.status });
  }

  const now = options.now || new Date().toISOString();
  const transcriptStatus = payload.transcriptStatus || call.transcriptStatus || 'pending';
  validateEnum(transcriptStatus, TRANSCRIPT_STATUSES, 'transcriptStatus');

  const completed = !payload.errorDetails;
  const updated = {
    ...call,
    status: completed ? 'completed' : 'failed',
    transcriptStatus,
    outcome: payload.outcome || call.outcome || (completed ? 'completed' : 'failed'),
    outcomeSummary: payload.outcomeSummary || call.outcomeSummary || null,
    escalationFlag: Boolean(payload.escalationFlag ?? call.escalationFlag),
    errorDetails: payload.errorDetails ? normalizeErrorDetails(payload.errorDetails) : call.errorDetails,
    metadata: { ...(call.metadata || {}), ...(payload.metadata || {}) },
    endedAt: call.endedAt || now,
    updatedAt: now,
  };

  validateCall(updated);
  const saved = await callStore.saveCall(updated);
  await recordCallAudit(saved.id, 'call.finalized', {
    previousStatus: call.status,
    status: saved.status,
    outcome: saved.outcome,
    transcriptStatus: saved.transcriptStatus,
    escalationFlag: saved.escalationFlag,
  }, options.actor || { type: 'system' }, now);

  return serializeCall(saved);
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
  validateRequired(callId, 'callId');
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

function assertTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return;
  }
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    throw createUiError('INVALID_STATUS_TRANSITION', 'Terminal calls cannot transition to another status.', {
      currentStatus,
      nextStatus,
    });
  }
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
