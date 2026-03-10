const test = require('node:test');
const assert = require('node:assert/strict');

const {
  intakeFieldMetadata,
  buildSectionViewModel,
  buildReviewScreen,
  validateField,
} = require('../src/manual-intake');

test('renders required vs optional indicators from field metadata', () => {
  const vm = buildSectionViewModel('patient_identity', {});
  const firstName = vm.fields.find((field) => field.key === 'first_name');
  const dob = vm.fields.find((field) => field.key === 'date_of_birth');

  assert.equal(firstName.required, true);
  assert.equal(firstName.requiredIndicator, 'Required');
  assert.equal(dob.requiredIndicator, 'Required');

  assert.equal(intakeFieldMetadata.phone.required, false);
});

test('shows inline validation error and helper copy', () => {
  const vm = buildSectionViewModel('patient_identity', {
    first_name: '',
    last_name: 'Lee',
    date_of_birth: '01/01/2000',
  });

  const firstName = vm.fields.find((field) => field.key === 'first_name');
  const dob = vm.fields.find((field) => field.key === 'date_of_birth');

  assert.match(firstName.error, /required/i);
  assert.match(dob.error, /YYYY-MM-DD/);
  assert.match(firstName.helperText, /legal first name/i);
});

test('includes progress indicator and section navigation state', () => {
  const vm = buildSectionViewModel('insurance_basics', {});

  assert.equal(vm.progress.totalSteps, 4);
  assert.equal(vm.progress.currentStep, 3);
  assert.ok(vm.progress.percentComplete >= 75);

  const active = vm.sectionNavigation.find((step) => step.active);
  assert.equal(active.id, 'insurance_basics');
});

test('review stub returns missing required fields and submit gate', () => {
  const review = buildReviewScreen({
    first_name: 'Ana',
    last_name: '',
    date_of_birth: '1990-05-20',
    chief_complaint: '',
  });

  assert.equal(review.canSubmit, false);
  assert.deepEqual(
    review.missingRequiredFields.map((x) => x.fieldKey).sort(),
    ['chief_complaint', 'last_name'],
  );
});

test('basic field-level validation interaction works', () => {
  assert.equal(validateField('first_name', ''), 'First Name is required.');
  assert.equal(validateField('insurance_member_id', ''), null);
  assert.equal(validateField('date_of_birth', '1990/01/01'), 'Date of Birth must use YYYY-MM-DD.');
});
