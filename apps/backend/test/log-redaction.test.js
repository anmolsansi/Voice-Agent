const test = require('node:test');
const assert = require('node:assert/strict');
const { redactPayload } = require('../src/security/log-redaction');

test('redacts sensitive intake fields', () => {
  const input = {
    first_name: 'Ava',
    last_name: 'Ng',
    date_of_birth: '1990-01-01',
    phone: '555-1111',
    insurance_member_id: 'ABC-123',
    chief_complaint: 'cough',
  };

  const out = redactPayload(input);
  assert.equal(out.first_name, '[REDACTED]');
  assert.equal(out.last_name, '[REDACTED]');
  assert.equal(out.date_of_birth, '[REDACTED]');
  assert.equal(out.phone, '[REDACTED]');
  assert.equal(out.insurance_member_id, '[REDACTED]');
  assert.equal(out.chief_complaint, 'cough');
});
