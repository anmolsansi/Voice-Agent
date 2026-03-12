const test = require('node:test');
const assert = require('node:assert/strict');
const { safeOrchestrateVoiceEventLog } = require('../src/voice/safe-orchestrate');

test('safeOrchestrateVoiceEventLog returns non-throwing failure payload on bad input', () => {
  const out = safeOrchestrateVoiceEventLog(null);
  assert.equal(out.ok, false);
  assert.equal(out.batch.statementCount, 0);
  assert.equal(typeof out.failure.errorCode, 'string');
});

test('safeOrchestrateVoiceEventLog returns success payload for valid input', () => {
  const out = safeOrchestrateVoiceEventLog({
    event: {
      type: 'final_transcript',
      sessionId: 'session_safe_1',
      utteranceId: 'utt_safe_1',
      text: 'first name is ivy and chief complaint is cough',
      timestamp: Date.now(),
    },
  });

  assert.equal(out.ok, true);
  assert.ok(out.batch.statementCount >= 1);
});
