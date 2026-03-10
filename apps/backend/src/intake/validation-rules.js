const { intakeFieldMetadata, getFieldConfig } = require('./field-metadata');

function validateRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateDateOfBirth(value) {
  if (!validateRequiredText(value)) return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;

  const [year, month, day] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

function validateField(fieldKey, value) {
  const config = getFieldConfig(fieldKey);
  if (!config) {
    return { valid: false, reason: 'unknown_field' };
  }

  if (!config.required && (value === null || value === undefined || value === '')) {
    return { valid: true, reason: null };
  }

  if (fieldKey === 'date_of_birth') {
    const ok = validateDateOfBirth(value);
    return { valid: ok, reason: ok ? null : 'invalid_date_format' };
  }

  const ok = validateRequiredText(value);
  return { valid: ok, reason: ok ? null : 'required_text_missing' };
}

module.exports = {
  intakeFieldMetadata,
  validateField,
};
