const { intakeFieldMetadata } = require('./field-metadata');
const { validateField } = require('./validation-rules');

function evaluateSubmissionReadiness(formData = {}) {
  const missingRequiredFields = [];

  for (const [fieldKey, config] of Object.entries(intakeFieldMetadata)) {
    if (!config.required) continue;
    const validation = validateField(fieldKey, formData[fieldKey]);
    if (!validation.valid) {
      missingRequiredFields.push({
        fieldKey,
        reason: validation.reason,
      });
    }
  }

  return {
    canSubmit: missingRequiredFields.length === 0,
    missingRequiredFields,
  };
}

module.exports = {
  evaluateSubmissionReadiness,
};
