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


test('mapper preserves mapping order and confidence differs for partial vs final', () => {
  const partial = mapTranscriptEventToFieldUpdates({
    type: 'partial_transcript',
    sessionId: 'session_2',
    utteranceId: 'utt_partial',
    text: 'first name is Jamie and last name is Chen',
    timestamp: Date.now(),
  });

  const final = mapTranscriptEventToFieldUpdates({
    type: 'final_transcript',
    sessionId: 'session_2',
    utteranceId: 'utt_final',
    text: 'first name is Jamie and last name is Chen',
    timestamp: Date.now(),
  });

  assert.equal(partial.error, null);
  assert.equal(final.error, null);

  assert.deepEqual(
    partial.updates.map((u) => u.fieldKey),
    ['first_name', 'last_name'],
  );
  assert.deepEqual(
    final.updates.map((u) => u.fieldKey),
    ['first_name', 'last_name'],
  );

  assert.ok(partial.updates.every((u) => u.confidence === 0.55));
  assert.ok(final.updates.every((u) => u.confidence === 0.85));
});


test('mapper propagates utterance id to each extracted update', () => {
  const output = mapTranscriptEventToFieldUpdates({
    type: 'final_transcript',
    sessionId: 'session_3',
    utteranceId: 'utt_propagation_1',
    text: 'first name is Mina and chief complaint is dizziness',
    timestamp: Date.now(),
  });

  assert.equal(output.error, null);
  assert.ok(output.updates.length >= 2);
  assert.ok(output.updates.every((u) => u.utteranceId === 'utt_propagation_1'));
});
