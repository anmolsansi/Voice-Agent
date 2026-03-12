function shapeVoiceEventLogResponse(orchestratorResult) {
  if (!orchestratorResult || typeof orchestratorResult !== 'object') {
    return {
      ok: false,
      statementCount: 0,
      retryableFailure: false,
      errorCode: 'unknown_error',
    };
  }

  return {
    ok: Boolean(orchestratorResult.ok),
    statementCount: orchestratorResult.batch?.statementCount || 0,
    retryableFailure: Boolean(orchestratorResult.failure?.retryable || false),
    errorCode: orchestratorResult.failure?.errorCode || null,
  };
}

module.exports = {
  shapeVoiceEventLogResponse,
};
