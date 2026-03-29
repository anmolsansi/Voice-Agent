const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createIntakeSession,
  intakeSessionStore,
  saveFieldValue,
  submitIntakeSession,
} = require('./session-service');

function resetStore() {
  intakeSessionStore.sessions.clear();
  intakeSessionStore.submissions.clear();
}

function createSession() {
  resetStore();
  return createIntakeSession({ sourceMode: 'manual' });
}

function completeRequiredFields(sessionId) {
  saveFieldValue({ sessionId, fieldKey: 'patient.firstName', value: '  Ada ', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'patient.lastName', value: '  Lovelace ', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'patient.dateOfBirth', value: '1990-04-20T18:30:00.000Z', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'patient.phone', value: '(312) 555-0100', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'patient.sexAtBirth', value: 'female', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'visit.chiefComplaint', value: '  Sore throat for two days ', source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'consent.treatmentConsent', value: true, source: 'manual' });
  saveFieldValue({ sessionId, fieldKey: 'consent.signatureName', value: ' Ada Lovelace ', source: 'manual' });
}

test('normalizes valid MVP fields and clears missing required summary state', () => {
  const session = createSession();

  saveFieldValue({ sessionId: session.id, fieldKey: 'patient.firstName', value: '  Ada ', source: 'manual' });
  saveFieldValue({ sessionId: session.id, fieldKey: 'patient.lastName', value: '  Lovelace ', source: 'manual' });
  const dobResult = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.dateOfBirth', value: '1990-04-20T18:30:00.000Z', source: 'manual' });
  const phoneResult = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.phone', value: '(312) 555-0100', source: 'manual' });
  saveFieldValue({ sessionId: session.id, fieldKey: 'patient.sexAtBirth', value: 'female', source: 'manual' });
  saveFieldValue({ sessionId: session.id, fieldKey: 'visit.chiefComplaint', value: '  Sore throat for two days ', source: 'manual' });
  saveFieldValue({ sessionId: session.id, fieldKey: 'consent.treatmentConsent', value: true, source: 'manual' });
  const signatureResult = saveFieldValue({ sessionId: session.id, fieldKey: 'consent.signatureName', value: ' Ada Lovelace ', source: 'manual' });

  assert.equal(dobResult.field.value, '1990-04-20');
  assert.equal(phoneResult.field.value, '+13125550100');
  assert.equal(signatureResult.validation.code, 'ok');
  assert.deepEqual(signatureResult.section.incompleteRequiredFields, []);
  assert.equal(signatureResult.section.completionState, 'in_progress');

  const storedSession = intakeSessionStore.get(session.id);
  assert.equal(storedSession.fields['consent.signedAt'].lastUpdatedBySource, 'system');
  assert.equal(storedSession.completionSummary.incompleteRequiredFields, 0);
  assert.deepEqual(
    storedSession.sections.map((section) => [section.key, section.incompleteRequiredFields]),
    [
      ['demographics', []],
      ['visit_reason', []],
      ['consent', []],
    ],
  );
});

test('requires at least one valid contact method and reports a single demographic summary gap', () => {
  const session = createSession();

  const missingPhone = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.phone', value: '   ', source: 'manual' });
  assert.equal(missingPhone.validation.code, 'required_missing');
  assert.equal(missingPhone.validation.message, 'At least one contact method is required: provide a phone number or email address.');
  assert.deepEqual(missingPhone.section.incompleteRequiredFields, ['patient.firstName', 'patient.lastName', 'patient.dateOfBirth', 'patient.sexAtBirth', 'patient.contact']);

  const invalidEmail = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.email', value: 'not-an-email', source: 'manual' });
  assert.equal(invalidEmail.validation.code, 'invalid_format');
  assert.equal(invalidEmail.validation.blocking, true);
  assert.deepEqual(invalidEmail.section.incompleteRequiredFields, ['patient.firstName', 'patient.lastName', 'patient.dateOfBirth', 'patient.sexAtBirth', 'patient.contact']);

  const validEmail = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.email', value: ' Person@Example.COM ', source: 'manual' });
  assert.equal(validEmail.field.value, 'person@example.com');
  assert.equal(validEmail.validation.code, 'ok');
  assert.ok(!validEmail.section.incompleteRequiredFields.includes('patient.contact'));
});

test('rejects implausible dob, invalid chief complaint, and incomplete signature name with blocking validation', () => {
  const session = createSession();

  const badDob = saveFieldValue({ sessionId: session.id, fieldKey: 'patient.dateOfBirth', value: '1800-01-01', source: 'manual' });
  assert.equal(badDob.validation.code, 'invalid_value');
  assert.equal(badDob.validation.message, 'Date of birth must be within a plausible age range.');
  assert.equal(badDob.field.completionState, 'incomplete_required');

  const badComplaint = saveFieldValue({ sessionId: session.id, fieldKey: 'visit.chiefComplaint', value: 'x'.repeat(501), source: 'manual' });
  assert.equal(badComplaint.validation.code, 'invalid_value');
  assert.equal(badComplaint.validation.message, 'Chief complaint must be 500 characters or less.');
  assert.deepEqual(badComplaint.section.incompleteRequiredFields, ['visit.chiefComplaint']);

  const badSignature = saveFieldValue({ sessionId: session.id, fieldKey: 'consent.signatureName', value: 'Prince', source: 'manual' });
  assert.equal(badSignature.validation.code, 'invalid_value');
  assert.equal(badSignature.validation.message, 'Signature name must include first and last name.');
  assert.deepEqual(badSignature.section.incompleteRequiredFields, ['consent.treatmentConsent', 'consent.signatureName']);
});

test('submits a complete session and stores an in-memory submission payload', () => {
  const session = createSession();
  completeRequiredFields(session.id);

  const result = submitIntakeSession({ sessionId: session.id });

  assert.equal(result.sessionId, session.id);
  assert.equal(result.status, 'submitted');
  assert.ok(result.submittedAt);
  assert.ok(result.submissionId);
  assert.equal(result.validation.isSubmittable, true);
  assert.deepEqual(result.validation.incompleteRequiredFields, []);

  const storedSession = intakeSessionStore.get(session.id);
  assert.equal(storedSession.status, 'submitted');
  assert.equal(storedSession.submittedAt, result.submittedAt);

  const storedSubmission = intakeSessionStore.getSubmission(session.id);
  assert.equal(storedSubmission.submissionId, result.submissionId);
  assert.equal(storedSubmission.status, 'submitted');
  assert.equal(storedSubmission.payload.status, 'submitted');
  assert.equal(storedSubmission.payload.submittedAt, result.submittedAt);
});

test('blocks submission for incomplete sessions and reports missing fields and sections', () => {
  const session = createSession();
  saveFieldValue({ sessionId: session.id, fieldKey: 'patient.firstName', value: 'Ada', source: 'manual' });

  assert.throws(
    () => submitIntakeSession({ sessionId: session.id }),
    (error) => {
      assert.equal(error.code, 'SUBMISSION_BLOCKED');
      assert.equal(error.details.isSubmittable, false);
      assert.ok(error.details.incompleteRequiredFields.includes('patient.lastName'));
      assert.ok(error.details.incompleteRequiredFields.includes('visit.chiefComplaint'));
      assert.ok(error.details.incompleteRequiredFields.includes('consent.treatmentConsent'));
      assert.deepEqual(
        error.details.incompleteSections.map((section) => section.key),
        ['demographics', 'visit_reason', 'consent'],
      );
      return true;
    },
  );
});
