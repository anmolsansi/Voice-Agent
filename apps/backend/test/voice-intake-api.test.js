const test = require('node:test');
const assert = require('node:assert/strict');
const { processVoiceTranscriptEvent } = require('../src/api/voice-intake');

test('processVoiceTranscriptEvent returns mapped updates and outcomes', () => {
  const result = processVoiceTranscriptEvent({
    event: {
      type: 'final_transcript',
      sessionId: 's1',
      utteranceId: 'u1',
      text: 'first name is Ava and chief complaint is cough',
      timestamp: Date.now(),
    },
    attemptByField: {
      first_name: 1,
      chief_complaint: 1,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.error, null);
  assert.ok(result.updates.length >= 2);
  assert.ok(result.outcomes.every((o) => ['reprompt', 'manual_required', 'complete'].includes(o.nextAction)));
});

test('processVoiceTranscriptEvent returns invalid event error for malformed input', () => {
  const result = processVoiceTranscriptEvent({ event: { text: 'oops' } });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'invalid_transcript_event');
});
