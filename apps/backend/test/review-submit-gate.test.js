const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateSubmissionReadiness } = require('../src/intake/review-submit-gate');

test('blocks submit when required fields are missing', () => {
  const result = evaluateSubmissionReadiness({
    first_name: 'Ava',
    last_name: '',
    date_of_birth: '1990-01-01',
    chief_complaint: '',
  });

  assert.equal(result.canSubmit, false);
  assert.deepEqual(
    result.missingRequiredFields.map((x) => x.fieldKey).sort(),
    ['chief_complaint', 'last_name'],
  );
});

test('allows submit when all required fields are valid', () => {
  const result = evaluateSubmissionReadiness({
    first_name: 'Ava',
    last_name: 'Ng',
    date_of_birth: '1990-01-01',
    chief_complaint: 'cough',
  });

  assert.equal(result.canSubmit, true);
  assert.deepEqual(result.missingRequiredFields, []);
});
