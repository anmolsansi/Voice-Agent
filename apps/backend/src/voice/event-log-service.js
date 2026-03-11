const { processVoiceTranscriptEvent } = require('../api/voice-intake');
const { buildAuditEvent } = require('../audit/event-writer');
const { toAuditLogInsert } = require('../audit/persistence-adapter');

function createVoiceEventLogEntries({ event, attemptByField = {} }) {
  const processed = processVoiceTranscriptEvent({ event, attemptByField });
  if (!processed.ok) {
    return {
      ok: false,
      error: processed.error,
      auditInserts: [],
    };
  }

  const auditInserts = processed.updates.map((update) => {
    const matchingOutcome = processed.outcomes.find((o) => o.fieldKey === update.fieldKey);
    const auditEvent = buildAuditEvent({
      intakeSessionId: event.sessionId,
      actorType: 'system',
      eventType: 'voice_field_update_mapped',
      eventPayload: {
        fieldKey: update.fieldKey,
        value: update.value,
        confidence: update.confidence,
        utteranceId: update.utteranceId,
        outcome: matchingOutcome?.nextAction || null,
      },
    });

    return toAuditLogInsert(auditEvent);
  });

  return {
    ok: true,
    error: null,
    updates: processed.updates,
    outcomes: processed.outcomes,
    auditInserts,
  };
}

module.exports = {
  createVoiceEventLogEntries,
};
