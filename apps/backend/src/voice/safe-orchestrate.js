const { orchestrateVoiceEventLog } = require('./event-log-orchestrator');
const { normalizeVoiceEventError } = require('./error-normalizer');

function safeOrchestrateVoiceEventLog(input) {
  try {
    return orchestrateVoiceEventLog(input);
  } catch (error) {
    const normalized = normalizeVoiceEventError(error?.message);
    return {
      ok: false,
      failure: {
        errorCode: normalized.code,
        retryable: normalized.retryable,
      },
      batch: { statementCount: 0, statements: [] },
    };
  }
}

module.exports = {
  safeOrchestrateVoiceEventLog,
};
