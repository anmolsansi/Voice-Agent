const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createIntakeSession,
  intakeSessionStore,
  reviewIntakeSessionByPublicSessionId,
  saveFieldValue,
  submitIntakeSession,
} = require('./session-service');
const { closePool } = require('../../lib/db/postgres');

async function resetStore() {
  await intakeSessionStore.clearAll();
  await closePool();
  delete process.env.DATABASE_URL;
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  process.env.NODE_ENV = 'test';
}

test.beforeEach(async () => {
  await resetStore();
});

test.after(async () => {
  await resetStore();
});

async function createSession() {
  return createIntakeSession({ sourceMode: 'manual' });
}

async function completeRequiredFields(sessionId) {
  await saveFieldValue({ sessionId, fieldKey: 'patient.firstName', value: '  Ada ', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'patient.lastName', value: '  Lovelace ', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'patient.dateOfBirth', value: '1990-04-20T18:30:00.000Z', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'patient.phone', value: '(312) 555-0100', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'patient.sexAtBirth', value: 'female', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'visit.chiefComplaint', value: '  Sore throat for two days ', source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'consent.treatmentConsent', value: true, source: 'manual' });
  await saveFieldValue({ sessionId, fieldKey: 'consent.signatureName', value: ' Ada Lovelace ', source: 'manual' });
}

test('normalizes valid MVP fields and clears missing required summary state', async () => {
  const session = await createSession();

  await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.firstName', value: '  Ada ', source: 'manual' });
  await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.lastName', value: '  Lovelace ', source: 'manual' });
  const dobResult = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.dateOfBirth', value: '1990-04-20T18:30:00.000Z', source: 'manual' });
  const phoneResult = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.phone', value: '(312) 555-0100', source: 'manual' });
  await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.sexAtBirth', value: 'female', source: 'manual' });
  await saveFieldValue({ sessionId: session.id, fieldKey: 'visit.chiefComplaint', value: '  Sore throat for two days ', source: 'manual' });
  await saveFieldValue({ sessionId: session.id, fieldKey: 'consent.treatmentConsent', value: true, source: 'manual' });
  const signatureResult = await saveFieldValue({ sessionId: session.id, fieldKey: 'consent.signatureName', value: ' Ada Lovelace ', source: 'manual' });

  assert.equal(dobResult.field.value, '1990-04-20');
  assert.equal(phoneResult.field.value, '+13125550100');
  assert.equal(signatureResult.validation.code, 'ok');
  assert.deepEqual(signatureResult.section.incompleteRequiredFields, []);
  assert.equal(signatureResult.section.completionState, 'in_progress');

  const storedSession = await intakeSessionStore.get(session.id);
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

test('requires at least one valid contact method and reports a single demographic summary gap', async () => {
  const session = await createSession();

  const missingPhone = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.phone', value: '   ', source: 'manual' });
  assert.equal(missingPhone.validation.code, 'required_missing');
  assert.equal(missingPhone.validation.message, 'At least one contact method is required: provide a phone number or email address.');
  assert.deepEqual(missingPhone.section.incompleteRequiredFields, ['patient.firstName', 'patient.lastName', 'patient.dateOfBirth', 'patient.sexAtBirth', 'patient.contact']);

  const invalidEmail = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.email', value: 'not-an-email', source: 'manual' });
  assert.equal(invalidEmail.validation.code, 'invalid_format');
  assert.equal(invalidEmail.validation.blocking, true);
  assert.deepEqual(invalidEmail.section.incompleteRequiredFields, ['patient.firstName', 'patient.lastName', 'patient.dateOfBirth', 'patient.sexAtBirth', 'patient.contact']);

  const validEmail = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.email', value: ' Person@Example.COM ', source: 'manual' });
  assert.equal(validEmail.field.value, 'person@example.com');
  assert.equal(validEmail.validation.code, 'ok');
  assert.ok(!validEmail.section.incompleteRequiredFields.includes('patient.contact'));
});

test('rejects implausible dob, invalid chief complaint, and incomplete signature name with blocking validation', async () => {
  const session = await createSession();

  const badDob = await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.dateOfBirth', value: '1800-01-01', source: 'manual' });
  assert.equal(badDob.validation.code, 'invalid_value');
  assert.equal(badDob.validation.message, 'Date of birth must be within a plausible age range.');
  assert.equal(badDob.field.completionState, 'incomplete_required');

  const badComplaint = await saveFieldValue({ sessionId: session.id, fieldKey: 'visit.chiefComplaint', value: 'x'.repeat(501), source: 'manual' });
  assert.equal(badComplaint.validation.code, 'invalid_value');
  assert.equal(badComplaint.validation.message, 'Chief complaint must be 500 characters or less.');
  assert.deepEqual(badComplaint.section.incompleteRequiredFields, ['visit.chiefComplaint']);

  const badSignature = await saveFieldValue({ sessionId: session.id, fieldKey: 'consent.signatureName', value: 'Prince', source: 'manual' });
  assert.equal(badSignature.validation.code, 'invalid_value');
  assert.equal(badSignature.validation.message, 'Signature name must include first and last name.');
  assert.deepEqual(badSignature.section.incompleteRequiredFields, ['consent.treatmentConsent', 'consent.signatureName']);
});

test('submits a complete session by public session id and stores a submission payload', async () => {
  const session = await createSession();
  await completeRequiredFields(session.id);

  const result = await submitIntakeSession({ publicSessionId: session.publicSessionId });

  assert.equal(result.publicSessionId, session.publicSessionId);
  assert.equal(result.status, 'submitted');
  assert.ok(result.submittedAt);
  assert.ok(result.submissionId);
  assert.equal(result.validation.isSubmittable, true);
  assert.deepEqual(result.validation.incompleteRequiredFields, []);

  const storedSession = await intakeSessionStore.get(session.id);
  assert.equal(storedSession.status, 'submitted');
  assert.equal(storedSession.submittedAt, result.submittedAt);

  const storedSubmission = await intakeSessionStore.getSubmission(session.id);
  assert.equal(storedSubmission.submissionId, result.submissionId);
  assert.equal(storedSubmission.status, 'submitted');
  assert.equal(storedSubmission.payload.status, 'submitted');
  assert.equal(storedSubmission.payload.submittedAt, result.submittedAt);
});

test('blocks submission for incomplete sessions and reports missing fields and sections', async () => {
  const session = await createSession();
  await saveFieldValue({ sessionId: session.id, fieldKey: 'patient.firstName', value: 'Ada', source: 'manual' });

  await assert.rejects(
    submitIntakeSession({ sessionId: session.id }),
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

test('marks a submitted session reviewed and stores optional notes', async () => {
  const session = await createSession();
  await completeRequiredFields(session.id);
  await submitIntakeSession({ sessionId: session.id });

  const reviewedSession = await reviewIntakeSessionByPublicSessionId({
    publicSessionId: session.publicSessionId,
    notes: 'Patient ready for nurse follow-up.',
  });

  assert.equal(reviewedSession.status, 'reviewed');
  assert.ok(reviewedSession.reviewedAt);
  assert.equal(reviewedSession.reviewNotes, 'Patient ready for nurse follow-up.');

  const storedSession = await intakeSessionStore.get(session.id);
  assert.equal(storedSession.status, 'reviewed');
  assert.equal(storedSession.reviewNotes, 'Patient ready for nurse follow-up.');
  assert.equal(storedSession.reviewedAt, reviewedSession.reviewedAt);
});
