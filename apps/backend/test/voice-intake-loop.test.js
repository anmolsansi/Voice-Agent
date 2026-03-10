const test = require('node:test');
const assert = require('node:assert/strict');

const { isTranscriptEvent, mapTranscriptEventToFieldUpdates, resolveRetryOutcome } = require('../src/voice');

test('transcript contract accepts valid event shape', () => {
  const ok = isTranscriptEvent({
    type: 'final_transcript',
    sessionId: 'session_1',
    utteranceId: 'utt_1',
    text: 'my first name is Alex',
    timestamp: Date.now(),
  });
  assert.equal(ok, true);
});

test('mapper returns field updates from transcript', () => {
  const output = mapTranscriptEventToFieldUpdates({
    type: 'final_transcript',
    sessionId: 'session_1',
    utteranceId: 'utt_22',
    text: 'my first name is Alex and chief complaint is chest pain',
    timestamp: Date.now(),
  });

  assert.equal(output.error, null);
  assert.ok(output.updates.length >= 2);
  assert.ok(output.updates.some((u) => u.fieldKey === 'first_name'));
  assert.ok(output.updates.some((u) => u.fieldKey === 'chief_complaint'));
});

test('mapper rejects invalid events', () => {
  const output = mapTranscriptEventToFieldUpdates({ text: 'bad' });
  assert.equal(output.error, 'invalid_transcript_event');
  assert.deepEqual(output.updates, []);
});

test('retry bridge maps invalid attempt to reprompt then manual_required', () => {
  const reprompt = resolveRetryOutcome({
    fieldKey: 'chief_complaint',
    value: '',
    attemptNumber: 1,
  });
  assert.equal(reprompt.nextAction, 'reprompt');

  const manual = resolveRetryOutcome({
    fieldKey: 'chief_complaint',
    value: '',
    attemptNumber: 3,
  });
  assert.equal(manual.nextAction, 'manual_required');
  assert.equal(manual.manualRequired, true);
});

test('retry bridge maps valid answer to complete', () => {
  const result = resolveRetryOutcome({
    fieldKey: 'chief_complaint',
    value: 'headache',
    attemptNumber: 1,
  });

  assert.equal(result.nextAction, 'complete');
  assert.equal(result.result, 'valid');
});
