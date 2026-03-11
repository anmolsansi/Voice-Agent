const test = require('node:test');
const assert = require('node:assert/strict');
const { createVoiceEventLogEntries } = require('../src/voice/event-log-service');
const { buildVoiceEventLogBatchInsert } = require('../src/voice/event-log-repo-adapter');

test('buildVoiceEventLogBatchInsert packages generated audit inserts', () => {
  const generated = createVoiceEventLogEntries({
    event: {
      type: 'final_transcript',
      sessionId: 'session_batch_1',
      utteranceId: 'utt_batch_1',
      text: 'first name is June and chief complaint is nausea',
      timestamp: Date.now(),
    },
  });

  const batch = buildVoiceEventLogBatchInsert(generated.auditInserts);
  assert.ok(batch.statementCount >= 2);
  assert.equal(batch.statementCount, batch.statements.length);
});

test('buildVoiceEventLogBatchInsert enforces array input', () => {
  assert.throws(() => buildVoiceEventLogBatchInsert(null), /auditInserts_array_required/);
});
