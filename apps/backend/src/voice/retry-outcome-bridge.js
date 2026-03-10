const { evaluateFieldAttempt } = require('../intake/retry-state-machine');

function resolveRetryOutcome({ fieldKey, value, attemptNumber, maxAttemptsOverride }) {
  const evaluation = evaluateFieldAttempt({ fieldKey, value, attemptNumber, maxAttemptsOverride });

  return {
    fieldKey,
    attemptNumber,
    nextAction: evaluation.nextState === 'reprompt'
      ? 'reprompt'
      : evaluation.nextState === 'incomplete_required'
        ? 'manual_required'
        : 'complete',
    result: evaluation.result,
    reason: evaluation.reason,
    manualRequired: evaluation.manualRequired,
  };
}

module.exports = {
  resolveRetryOutcome,
};
