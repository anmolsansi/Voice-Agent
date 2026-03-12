const test = require('node:test');
const assert = require('node:assert/strict');
const { summarizeVoiceEventLogRun } = require('../src/voice/event-log-metrics');

test('summarizeVoiceEventLogRun reports success stats', () => {
  const out = summarizeVoiceEventLogRun({ ok: true, batch: { statementCount: 3 }, failure: null });
  assert.deepEqual(out, { ok: true, statementCount: 3, retryableFailure: false });
});

test('summarizeVoiceEventLogRun reports retryable failure stats', () => {
  const out = summarizeVoiceEventLogRun({ ok: false, batch: { statementCount: 0 }, failure: { retryable: true } });
  assert.deepEqual(out, { ok: false, statementCount: 0, retryableFailure: true });
});
