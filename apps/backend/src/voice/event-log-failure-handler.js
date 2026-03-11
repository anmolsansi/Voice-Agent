const { normalizeVoiceEventError } = require('./error-normalizer');

function buildVoiceEventFailureRecord({ sessionId, errorCode }) {
  const normalized = normalizeVoiceEventError(errorCode);
  return {
    sessionId,
    errorCode: normalized.code,
    retryable: normalized.retryable,
    recordedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildVoiceEventFailureRecord,
};
