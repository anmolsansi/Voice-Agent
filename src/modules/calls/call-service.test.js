const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, api, query, closePool } = require('../../../tests/helpers/database.cjs');
const { createCallAttempt, updateCallStatus, finalizeCall } = require('./service');
const { persistCallDetail, getCallDetail } = require('./call-service');
let fixture, call;
beforeEach(async () => {
  fixture = await setup();
  const { patientId, scheduleId, idempotencyKey } = fixture;
  call = (await createCallAttempt({ patientId, scheduleId, idempotencyKey })).call;
  for (const status of ['starting','in_progress','finalizing']) await updateCallStatus(call.id, { status });
});
after(closePool);
test('persisted transcript turns sort by timestamp then sequence', async () => {
  await finalizeCall(call.id, { transcriptStatus: 'ready' });
  const detail = await persistCallDetail(call.id, { publicCallId: 'call_ordering', transcriptTurns: [
    { speaker: 'patient', text: 'Third', sequence: 2, startedAt: '2026-05-11T10:00:03Z' },
    { speaker: 'agent', text: 'First', sequence: 5, startedAt: '2026-05-11T10:00:01Z' },
    { speaker: 'patient', text: 'Second', sequence: 1, startedAt: '2026-05-11T10:00:03Z' },
  ] });
  assert.deepEqual(detail.transcript.turns.map((t) => t.text), ['First','Second','Third']);
  assert.equal(detail.transcript.status, 'complete');
});
test('linked detail API preserves shape, derives lifecycle and keeps recordings disabled', async () => {
  await finalizeCall(call.id, { transcriptStatus: 'ready', outcome: 'callback_needed' });
  const client = await api(fixture.token);
  try {
    const response = await client.request(`/api/calls/${call.id}/detail`, { publicCallId: 'call_shape', events: [{ eventType: 'Provider.Call Started', source: 'provider', providerEventId: 'evt-1', occurredAt: '2026-05-11T11:00:00Z' }], transcriptTurns: [{ speaker: 'agent', text: 'Synthetic greeting' }] }, 'PUT');
    assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
    await query("INSERT INTO recording_metadata(call_id,provider_recording_id,status,url,url_stored) SELECT id,'historical-test','available','https://example.test/historical',true FROM calls WHERE attempt_id=$1", [call.id]);
    const detail = (await (await client.request('/api/calls/call_shape/detail')).json()).callDetail;
    assert.equal(detail.call.attemptId, call.id); assert.equal(detail.call.status, 'completed');
    assert.equal(detail.timeline[0].eventType, 'provider_call_started');
    assert.equal(detail.transcript.turns[0].speaker, 'agent');
    assert.equal(detail.outcome.disposition, 'callback_needed');
    assert.equal(detail.recording.available, false); assert.equal(detail.recording.url, null);
    assert(detail.auditLogs.some((e) => e.action === 'call.detail_updated'));
    assert.equal((await client.request(`/api/calls/${call.id}/detail`, { status: 'queued' }, 'PUT')).status, 400);
    assert.equal((await client.request(`/api/calls/${call.id}/detail`, { recording: { url: 'https://example.test' } }, 'PUT')).status, 400);
  } finally { await client.close(); }
});
test('pending transcript represents delayed detail with no available turns', async () => {
  await finalizeCall(call.id, { transcriptStatus: 'pending' });
  await persistCallDetail(call.id, { publicCallId: 'delayed', transcriptUnavailableReason: 'provider_processing' });
  const detail = await getCallDetail('delayed');
  assert.equal(detail.transcript.status, 'delayed'); assert.equal(detail.transcript.isDelayed, true);
  assert.equal(detail.transcript.unavailableReason, 'provider_processing'); assert.deepEqual(detail.transcript.turns, []);
});
