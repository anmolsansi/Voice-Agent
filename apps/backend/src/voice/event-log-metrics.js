function summarizeVoiceEventLogRun(result) {
  if (!result || typeof result !== 'object') {
    return { ok: false, statementCount: 0, retryableFailure: false };
  }

  return {
    ok: Boolean(result.ok),
    statementCount: result.batch?.statementCount || 0,
    retryableFailure: Boolean(result.failure?.retryable || false),
  };
}

module.exports = {
  summarizeVoiceEventLogRun,
};
