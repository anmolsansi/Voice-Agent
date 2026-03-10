const { mapTranscriptEventToFieldUpdates, resolveRetryOutcome } = require('../voice');

function processVoiceTranscriptEvent({ event, attemptByField = {} }) {
  const mapped = mapTranscriptEventToFieldUpdates(event);
  if (mapped.error) {
    return { ok: false, error: mapped.error, updates: [], outcomes: [] };
  }

  const outcomes = mapped.updates.map((update) => {
    const attemptNumber = Number(attemptByField[update.fieldKey] || 1);
    return resolveRetryOutcome({
      fieldKey: update.fieldKey,
      value: update.value,
      attemptNumber,
    });
  });

  return {
    ok: true,
    error: null,
    updates: mapped.updates,
    outcomes,
  };
}

module.exports = {
  processVoiceTranscriptEvent,
};
