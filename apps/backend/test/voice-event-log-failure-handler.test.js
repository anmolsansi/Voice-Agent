const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVoiceEventFailureRecord } = require('../src/voice/event-log-failure-handler');

test('buildVoiceEventFailureRecord normalizes and returns retry metadata', () => {
  const out = buildVoiceEventFailureRecord({
    sessionId: 'session_fail_1',
    errorCode: 'invalid_transcript_event',
  });

  assert.equal(out.sessionId, 'session_fail_1');
  assert.equal(out.errorCode, 'invalid_transcript_event');
  assert.equal(out.retryable, true);
  assert.ok(typeof out.recordedAt === 'string');
});

test('buildVoiceEventFailureRecord maps unknown errors as non-retryable', () => {
  const out = buildVoiceEventFailureRecord({
    sessionId: 'session_fail_2',
    errorCode: 'weird_error',
  });

  assert.equal(out.errorCode, 'unknown_error');
  assert.equal(out.retryable, false);
});
