const { intakeFieldMetadata } = require('./field-metadata');

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function validateField(fieldKey, value) {
  const config = intakeFieldMetadata[fieldKey];
  if (!config) return 'Unknown field.';

  if (config.required && isBlank(value)) {
    return `${config.label} is required.`;
  }

  if (fieldKey === 'date_of_birth' && !isBlank(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
      return 'Date of Birth must use YYYY-MM-DD.';
    }
  }

  return null;
}

function validateForm(formData) {
  const errors = {};
  for (const fieldKey of Object.keys(intakeFieldMetadata)) {
    const err = validateField(fieldKey, formData[fieldKey]);
    if (err) errors[fieldKey] = err;
  }
  return errors;
}

module.exports = {
  validateField,
  validateForm,
};
