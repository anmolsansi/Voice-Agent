const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, api, query, closePool } = require('../../../tests/helpers/database.cjs');
const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');
let fixture;
beforeEach(async () => { fixture = await setup(); });
after(closePool);
function input() { const { patientId, scheduleId, idempotencyKey } = fixture; return { patientId, scheduleId, idempotencyKey }; }
test('authenticated call creation, duplicate requests, lists, detail and forged actors', async () => {
  const client = await api(fixture.token);
  try {
    assert.equal((await client.request('/api/calls', input(), 'POST', null)).status, 401);
    assert.equal((await client.request('/api/calls', { ...input(), actor: { type: 'admin' } })).status, 400);
    const first = await client.request('/api/calls', input());
    assert.equal(first.status, 201);
    const { call } = await first.json();
    assert.equal(call.status, 'queued'); assert.equal(call.attemptNumber, 1);
    const again = await client.request('/api/calls', input());
    assert.equal(again.status, 200); assert.equal((await again.json()).call.id, call.id);
    const list = await client.request(`/api/calls?patientId=${fixture.patientId}`);
    assert.equal((await list.json()).items[0].id, call.id);
    const detail = await client.request(`/api/calls/${call.id}`);
    assert.equal((await detail.json()).auditEvents[0].action, 'call.created');
    assert.equal((await client.request('/api/calls?patientId=invalid')).status, 400);
    assert.equal((await fetch(client.base + '/api/calls', { method: 'POST', headers: { authorization: `Bearer ${fixture.token}` }, body: '{' })).status, 400);
    assert.equal((await fetch(client.base + '/api/calls', { method: 'POST', headers: { authorization: `Bearer ${fixture.token}` }, body: 'x'.repeat(270000) })).status, 413);
  } finally { await client.close(); }
});
test('ordered lifecycle returns timestamps and outcome; delayed events cannot reopen terminal calls', async () => {
  const client = await api(fixture.token);
  try {
    const { call } = await (await client.request('/api/calls', input())).json();
    assert.equal((await client.request(`/api/calls/${call.id}/status`, { status: 'in_progress' })).status, 409);
    for (const status of ['starting','in_progress','finalizing']) assert.equal((await client.request(`/api/calls/${call.id}/status`, { status, providerIds: { callId: 'sandbox-1' }, transcriptStatus: 'pending' })).status, 200);
    const finish = { transcriptStatus: 'pending', outcome: 'needs_follow_up', outcomeSummary: 'Synthetic callback request', escalationFlag: true };
    const result = await client.request(`/api/calls/${call.id}/finalize`, finish);
    const payload = await result.json(); assert.equal(result.status, 200, JSON.stringify(payload));
    assert.equal(payload.call.status, 'completed'); assert.equal(payload.call.escalationFlag, true);
    assert.ok(payload.call.startedAt); assert.ok(payload.call.endedAt);
    assert.equal((await client.request(`/api/calls/${call.id}/finalize`, finish)).status, 200);
    assert.equal((await client.request(`/api/calls/${call.id}/finalize`, { outcome: 'different' })).status, 409);
    assert.equal((await client.request(`/api/calls/${call.id}/status`, { status: 'starting' })).status, 409);
  } finally { await client.close(); }
});
test('worker reads persisted schedules and repeated enqueue is idempotent', async () => {
  const first = await enqueueEligibleCheckInCalls();
  const second = await enqueueEligibleCheckInCalls();
  assert.equal(first.enqueued, 1); assert.equal(second.duplicates, 1);
  assert.equal(first.results[0].callId, second.results[0].callId);
});
test('scheduler API requires scoped machine token and rejects caller-owned schedules', async () => {
  const client = await api(fixture.token);
  process.env.SCHEDULER_TOKEN = 'synthetic-scheduler-credential-000000000000';
  try {
    assert.equal((await client.request('/api/jobs/checkins/enqueue', {})).status, 401);
    assert.equal((await client.request('/api/jobs/checkins/enqueue', { schedules: [] }, 'POST', process.env.SCHEDULER_TOKEN)).status, 400);
    const response = await client.request('/api/jobs/checkins/enqueue', {}, 'POST', process.env.SCHEDULER_TOKEN);
    assert.equal(response.status, 200); assert.equal((await response.json()).enqueued, 1);
    assert.equal((await client.request('/api/calls', undefined, 'GET', process.env.SCHEDULER_TOKEN)).status, 401);
    const { rows: [count] } = await query('SELECT count(*)::int AS n FROM call_attempts'); assert.equal(count.n, 1);
  } finally { delete process.env.SCHEDULER_TOKEN; await client.close(); }
});
