const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { setup, query, closePool } = require('./helpers/database.cjs');
const calls = require('../src/modules/calls/service');
const details = require('../src/modules/calls/call-service');
const { callStore } = require('../src/modules/calls/store');
const { intakeSessionStore } = require('../src/modules/intake/session-store');
const { createIntakeSession } = require('../src/modules/intake/session-service');
let fixture;
beforeEach(async () => { fixture = await setup(); });
after(closePool);
function input(key = fixture.idempotencyKey) { return { patientId: fixture.patientId, scheduleId: fixture.scheduleId, idempotencyKey: key }; }
test('concurrent duplicate creation has exactly one attempt and mandatory audit', async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => calls.createCallAttempt(input())));
  assert.equal(new Set(results.map((r) => r.call.id)).size, 1);
  assert.equal(results.filter((r) => r.created).length, 1);
  const { rows: [count] } = await query("SELECT count(*)::int AS n FROM audit_logs WHERE action='call.created'");
  assert.equal(count.n, 1);
  await assert.rejects(calls.createCallAttempt({ ...input(), metadata: { source: 'changed' } }), { code: 'IDEMPOTENCY_CONFLICT' });
});
test('concurrent distinct attempts allocate unique ordered numbers', async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => calls.createCallAttempt(input(randomUUID()))));
  assert.deepEqual(results.map((r) => r.call.attemptNumber).sort((a,b) => a-b), [1,2,3,4,5,6,7,8]);
});
test('terminal races serialize and exact replay neither modifies data nor duplicates audit', async () => {
  const { call } = await calls.createCallAttempt(input());
  const outcomes = await Promise.allSettled([
    calls.updateCallStatus(call.id, { status: 'canceled' }),
    calls.updateCallStatus(call.id, { status: 'failed' }),
  ]);
  assert.equal(outcomes.filter((r) => r.status === 'fulfilled').length, 1);
  const original = (await calls.getCallDetail(call.id));
  await calls.updateCallStatus(call.id, { status: original.call.status });
  assert.deepEqual(await calls.getCallDetail(call.id), original);
  await assert.rejects(calls.finalizeCall(call.id, {}), { code: 'INVALID_STATUS_TRANSITION' });
});
test('mandatory audit failure rolls back creation and state changes', async () => {
  const { call } = await calls.createCallAttempt(input());
  await query("CREATE FUNCTION foundation_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic audit failure'; END $$");
  await query('CREATE TRIGGER foundation_reject_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION foundation_reject_audit()');
  try {
    await assert.rejects(calls.createCallAttempt(input(randomUUID())), { code: 'PERSISTENCE_UNAVAILABLE' });
    await assert.rejects(calls.updateCallStatus(call.id, { status: 'starting' }), { code: 'PERSISTENCE_UNAVAILABLE' });
    assert.equal((await calls.getCallDetail(call.id)).call.status, 'queued');
    const { rows: [count] } = await query('SELECT count(*)::int AS n FROM call_attempts'); assert.equal(count.n, 1);
  } finally {
    await query('DROP TRIGGER foundation_reject_audit ON audit_logs');
    await query('DROP FUNCTION foundation_reject_audit()');
  }
});
test('detail batch failure rolls back earlier writes and cannot update another call transcript', async () => {
  const first = (await calls.createCallAttempt(input())).call;
  const second = (await calls.createCallAttempt(input(randomUUID()))).call;
  const turnId = randomUUID();
  await details.persistCallDetail(first.id, { publicCallId: 'first', transcriptTurns: [{ id: turnId, speaker: 'patient', text: 'Original' }] });
  await assert.rejects(details.persistCallDetail(second.id, { publicCallId: 'second', events: [{ eventType: 'started' }], transcriptTurns: [{ id: turnId, speaker: 'patient', text: 'Wrong call' }] }), { code: 'TRANSCRIPT_CONFLICT' });
  await assert.rejects(details.getCallDetail('second'), { code: 'CALL_NOT_FOUND' });
  assert.equal((await details.getCallDetail('first')).transcript.turns[0].text, 'Original');
});
test('database survives pool restart and deleted rows never reappear from process caches', async () => {
  const { call } = await calls.createCallAttempt(input());
  await details.persistCallDetail(call.id, { publicCallId: 'restart' });
  await closePool();
  assert.equal((await calls.getCallDetail(call.id)).call.id, call.id);
  assert.equal((await details.getCallDetail('restart')).call.attemptId, call.id);
  await query('DELETE FROM calls WHERE attempt_id=$1', [call.id]);
  await assert.rejects(details.getCallDetail('restart'), { code: 'CALL_NOT_FOUND' });
  await query('DELETE FROM call_attempts WHERE id=$1', [call.id]);
  assert.equal(await callStore.getCall(call.id), null);
  const session = await createIntakeSession({ sourceMode: 'manual' });
  await intakeSessionStore.get(session.id);
  await query('DELETE FROM intake_session_state WHERE id=$1', [session.id]);
  assert.equal(await intakeSessionStore.get(session.id), null);
});
test('unavailable database fails closed even when fallback flag is true', async () => {
  const previous = process.env.DATABASE_URL;
  await closePool(); process.env.DATABASE_URL = 'postgresql://invalid@127.0.0.1:1/unavailable';
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  try { await assert.rejects(calls.createCallAttempt(input()), { code: 'PERSISTENCE_UNAVAILABLE' }); }
  finally { await closePool(); process.env.DATABASE_URL = previous; delete process.env.ALLOW_MEMORY_FALLBACK; }
});
test('relationships reject mismatched patient/schedule and orphan identities', async () => {
  await assert.rejects(calls.createCallAttempt({ ...input(), patientId: randomUUID() }), { code: 'INVALID_SCHEDULE' });
  await assert.rejects(query('UPDATE checkin_schedules SET patient_id=$1 WHERE id=$2', [randomUUID(), fixture.scheduleId]), { code: '23503' });
});

test('competing detail identifiers cannot overwrite another attempt', async () => {
  const first = (await calls.createCallAttempt(input())).call;
  const second = (await calls.createCallAttempt(input(randomUUID()))).call;
  const results = await Promise.allSettled([
    details.persistCallDetail(first.id, { publicCallId: 'shared-id' }),
    details.persistCallDetail(second.id, { publicCallId: 'shared-id' }),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'DETAIL_ID_CONFLICT');
});
