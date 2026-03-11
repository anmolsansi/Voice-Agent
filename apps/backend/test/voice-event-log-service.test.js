const test = require('node:test');
const assert = require('node:assert/strict');
const { createVoiceEventLogEntries } = require('../src/voice/event-log-service');

test('createVoiceEventLogEntries returns insert payloads for mapped transcript fields', () => {
  const result = createVoiceEventLogEntries({
    event: {
      type: 'final_transcript',
      sessionId: 'session_evt_1',
      utteranceId: 'utt_evt_1',
      text: 'first name is Aria and chief complaint is fever',
      timestamp: Date.now(),
    },
    attemptByField: {
      first_name: 1,
      chief_complaint: 1,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.error, null);
  assert.ok(result.auditInserts.length >= 2);
  assert.ok(result.auditInserts.every((q) => /INSERT INTO audit_logs/i.test(q.text)));
  assert.ok(result.auditInserts.every((q) => q.values[1] === 'session_evt_1'));
});

test('createVoiceEventLogEntries returns error for invalid transcript event', () => {
  const result = createVoiceEventLogEntries({
    event: { text: 'bad event' },
  });

  assert.equal(result.ok, false);
  assert.equal(result.error, 'invalid_transcript_event');
  assert.deepEqual(result.auditInserts, []);
});
