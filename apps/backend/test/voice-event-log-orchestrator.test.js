const test = require('node:test');
const assert = require('node:assert/strict');
const { orchestrateVoiceEventLog } = require('../src/voice/event-log-orchestrator');

test('orchestrateVoiceEventLog returns batch statements on valid event', () => {
  const out = orchestrateVoiceEventLog({
    event: {
      type: 'final_transcript',
      sessionId: 'session_orch_1',
      utteranceId: 'utt_orch_1',
      text: 'first name is Leo and chief complaint is sore throat',
      timestamp: Date.now(),
    },
  });

  assert.equal(out.ok, true);
  assert.equal(out.failure, null);
  assert.ok(out.batch.statementCount >= 2);
  assert.equal(out.batch.statementCount, out.batch.statements.length);
});

test('orchestrateVoiceEventLog returns normalized failure on invalid event', () => {
  const out = orchestrateVoiceEventLog({
    event: { text: 'bad' },
  });

  assert.equal(out.ok, false);
  assert.equal(out.batch.statementCount, 0);
  assert.equal(out.failure.errorCode, 'invalid_transcript_event');
  assert.equal(out.failure.retryable, true);
});
