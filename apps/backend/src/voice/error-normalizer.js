function normalizeVoiceEventError(errorCode) {
  if (!errorCode) return { code: 'unknown_error', retryable: false };

  const map = {
    invalid_transcript_event: { code: 'invalid_transcript_event', retryable: true },
    intakeSessionId_required: { code: 'audit_event_invalid', retryable: false },
    actorType_required: { code: 'audit_event_invalid', retryable: false },
    eventType_required: { code: 'audit_event_invalid', retryable: false },
  };

  return map[errorCode] || { code: 'unknown_error', retryable: false };
}

module.exports = {
  normalizeVoiceEventError,
};
