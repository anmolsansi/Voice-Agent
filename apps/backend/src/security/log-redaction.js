const SENSITIVE_KEYS = ['first_name', 'last_name', 'date_of_birth', 'phone', 'insurance_member_id'];

function redactPayload(payload = {}) {
  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.includes(key)) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = value;
    }
  }
  return out;
}

module.exports = {
  SENSITIVE_KEYS,
  redactPayload,
};
