const { query, transaction } = require('../../lib/db/postgres');
const { fail, objectInput, uuid } = require('../../http/errors');
const { getCallDetail: getAttempt } = require('./service');
const { buildCallDetailContract, callDetailStore, normalizeCall, normalizeEvent, normalizeTranscriptTurn } = require('./call-store');

async function persistCallDetail(attemptId, input = {}, options = {}) {
  uuid(attemptId);
  objectInput(input, ['publicCallId','intakeSessionId','provider','direction','transcriptUnavailableReason','events','transcriptTurns']);
  for (const field of ['publicCallId','provider','transcriptUnavailableReason']) {
    if (input[field] !== undefined && (typeof input[field] !== 'string' || !input[field].trim() || input[field].length > 200)) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid detail text.');
  }
  if (input.intakeSessionId) uuid(input.intakeSessionId);
  if (input.direction !== undefined && !['inbound','outbound'].includes(input.direction)) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid direction.');
  const events = input.events || [];
  const turns = input.transcriptTurns || [];
  if (!Array.isArray(events) || !Array.isArray(turns) || events.length > 500 || turns.length > 500) throw fail(400, 'INVALID_CALL_DETAIL', 'Detail collections must contain at most 500 items.');
  for (const event of events) {
    objectInput(event, ['eventType','source','sequence','occurredAt','providerEventId']);
    if (typeof event.eventType !== 'string' || !event.eventType || event.eventType.length > 100) throw fail(400, 'INVALID_CALL_DETAIL', 'Event type required.');
    validateTimestamp(event.occurredAt);
    validateSequence(event.sequence);
    for (const field of ['source','providerEventId']) if (event[field] !== undefined && (typeof event[field] !== 'string' || event[field].length > 200)) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid event identifier.');
  }
  for (const turn of turns) {
    objectInput(turn, ['id','speaker','text','sequence','startedAt','endedAt','confidence','isPartial']);
    if (turn.id) uuid(turn.id);
    if (!['patient','agent','system','unknown'].includes(turn.speaker) || typeof turn.text !== 'string' || turn.text.length > 16000) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid transcript turn.');
    validateTimestamp(turn.startedAt); validateTimestamp(turn.endedAt); validateSequence(turn.sequence);
    if (turn.confidence !== undefined && (typeof turn.confidence !== 'number' || turn.confidence < 0 || turn.confidence > 1)) throw fail(400, 'INVALID_CALL_DETAIL', 'Confidence must be between zero and one.');
    if (turn.isPartial !== undefined && typeof turn.isPartial !== 'boolean') throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid partial flag.');
  }
  return transaction(async () => {
    const lock = await query('SELECT id FROM call_attempts WHERE id=$1 FOR UPDATE', [attemptId]);
    if (!lock.rowCount) throw fail(404, 'CALL_NOT_FOUND', 'Call attempt not found.');
    const { call: attempt } = await getAttempt(attemptId);
    const { rows: [existing] } = await query('SELECT * FROM calls WHERE attempt_id=$1', [attemptId]);
    const publicCallId = input.publicCallId || existing?.public_call_id || attemptId;
    if (existing && existing.public_call_id !== publicCallId) throw fail(409, 'DETAIL_ID_CONFLICT', 'Public call identifier cannot change.');
    const collision = await query('SELECT id FROM calls WHERE public_call_id=$1 AND attempt_id<>$2', [publicCallId, attemptId]);
    if (collision.rowCount) throw fail(409, 'DETAIL_ID_CONFLICT', 'Public call identifier already exists.');
    const call = normalizeCall({
      ...input, id: existing?.id, attemptId, publicCallId,
      status: attempt.status, startedAt: attempt.startedAt || attempt.queuedAt, endedAt: attempt.endedAt,
      providerCallId: attempt.providerIds.callId,
      transcriptStatus: { not_started: 'unavailable', pending: 'delayed', ready: 'complete', failed: 'unavailable' }[attempt.transcriptStatus],
      outcome: attempt.outcome ? { disposition: attempt.outcome } : {},
    });
    const saved = await callDetailStore.saveCall(call);
    for (const [index, event] of events.entries()) await callDetailStore.saveEvent(normalizeEvent(event, saved.id, index));
    for (const [index, turn] of turns.entries()) await callDetailStore.saveTranscriptTurn(normalizeTranscriptTurn(turn, saved.id, index));
    await query(`INSERT INTO audit_logs(actor_type,actor_id,action,entity_type,entity_id,metadata)
      VALUES($1,$2,'call.detail_updated','call_attempt',$3,$4)`, [options.actor?.type || 'system', options.actor?.id || null, attemptId, { eventCount: events.length, turnCount: turns.length }]);
    return getCallDetail(publicCallId);
  });
}
function validateTimestamp(value) {
  if (value !== undefined && (typeof value !== 'string' || !Number.isFinite(Date.parse(value)))) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid timestamp.');
}
function validateSequence(value) {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) throw fail(400, 'INVALID_CALL_DETAIL', 'Invalid sequence.');
}
async function getCallDetail(publicCallId) {
  if (typeof publicCallId !== 'string' || !publicCallId.trim() || publicCallId.length > 200) throw fail(400, 'INVALID_PUBLIC_CALL_ID', 'Valid public call identifier required.');
  return transaction(async () => {
    const detail = await callDetailStore.getDetailByPublicCallId(publicCallId);
    if (!detail) throw fail(404, 'CALL_NOT_FOUND', 'Call detail not found.');
    return buildCallDetailContract(detail);
  });
}
module.exports = { getCallDetail, persistCallDetail };
