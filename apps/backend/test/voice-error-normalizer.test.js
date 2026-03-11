const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeVoiceEventError } = require('../src/voice/error-normalizer');

test('normalizes known retryable transcript error', () => {
  const out = normalizeVoiceEventError('invalid_transcript_event');
  assert.equal(out.code, 'invalid_transcript_event');
  assert.equal(out.retryable, true);
});

test('normalizes known audit validation errors', () => {
  const out = normalizeVoiceEventError('eventType_required');
  assert.equal(out.code, 'audit_event_invalid');
  assert.equal(out.retryable, false);
});

test('falls back to unknown_error for unexpected codes', () => {
  const out = normalizeVoiceEventError('something_else');
  assert.equal(out.code, 'unknown_error');
  assert.equal(out.retryable, false);
});
