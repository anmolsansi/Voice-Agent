const test = require('node:test');
const assert = require('node:assert/strict');
const { shapeVoiceEventLogResponse } = require('../src/voice/event-log-response-shaper');

test('shapes successful orchestrator result', () => {
  const out = shapeVoiceEventLogResponse({
    ok: true,
    batch: { statementCount: 4 },
    failure: null,
  });

  assert.deepEqual(out, {
    ok: true,
    statementCount: 4,
    retryableFailure: false,
    errorCode: null,
  });
});

test('shapes failed orchestrator result with retry metadata', () => {
  const out = shapeVoiceEventLogResponse({
    ok: false,
    batch: { statementCount: 0 },
    failure: { retryable: true, errorCode: 'invalid_transcript_event' },
  });

  assert.deepEqual(out, {
    ok: false,
    statementCount: 0,
    retryableFailure: true,
    errorCode: 'invalid_transcript_event',
  });
});
