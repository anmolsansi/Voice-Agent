const { getFieldConfig } = require('./field-metadata');
const { validateField } = require('./validation-rules');

function evaluateFieldAttempt({ fieldKey, value, attemptNumber, maxAttemptsOverride }) {
  const config = getFieldConfig(fieldKey);
  if (!config) {
    return {
      nextState: 'invalid',
      result: 'invalid',
      reason: 'unknown_field',
      attemptNumber,
      manualRequired: false,
    };
  }

  const maxAttempts = maxAttemptsOverride ?? config.maxAttempts ?? 3;
  const validation = validateField(fieldKey, value);

  if (validation.valid) {
    return {
      nextState: 'complete',
      result: 'valid',
      reason: null,
      attemptNumber,
      manualRequired: false,
    };
  }

  const manualRequired = attemptNumber >= maxAttempts;
  return {
    nextState: manualRequired ? 'incomplete_required' : 'reprompt',
    result: manualRequired ? 'manual_required' : 'invalid',
    reason: validation.reason,
    attemptNumber,
    manualRequired,
  };
}

module.exports = {
  evaluateFieldAttempt,
};
