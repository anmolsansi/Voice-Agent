const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { intakeFieldMetadata, validateField } = require('../src/intake/validation-rules');
const { evaluateFieldAttempt } = require('../src/intake/retry-state-machine');

test('schema.sql defines all intake domain tables', () => {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const requiredTables = ['patients', 'intake_sessions', 'responses', 'validation_events', 'audit_logs'];
  for (const tableName of requiredTables) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
  }

  assert.match(sql, /CHECK \(status IN \('in_progress', 'incomplete_required', 'ready_for_review', 'submitted'\)\)/);
  assert.match(sql, /UNIQUE \(intake_session_id, field_key\)/);
});

test('field metadata marks required and optional fields', () => {
  assert.equal(intakeFieldMetadata.first_name.required, true);
  assert.equal(intakeFieldMetadata.insurance_member_id.required, false);
});

test('validation skeleton validates required text and date format', () => {
  assert.deepEqual(validateField('first_name', ''), { valid: false, reason: 'required_text_missing' });
  assert.deepEqual(validateField('date_of_birth', '2020-13-40'), { valid: false, reason: 'invalid_date_format' });
  assert.deepEqual(validateField('date_of_birth', '2020/01/01'), { valid: false, reason: 'invalid_date_format' });
  assert.deepEqual(validateField('insurance_member_id', ''), { valid: true, reason: null });
});

test('retry state machine transitions to reprompt then manual_required', () => {
  const firstAttempt = evaluateFieldAttempt({
    fieldKey: 'chief_complaint',
    value: '',
    attemptNumber: 1,
  });
  assert.equal(firstAttempt.nextState, 'reprompt');
  assert.equal(firstAttempt.result, 'invalid');
  assert.equal(firstAttempt.manualRequired, false);

  const finalAttempt = evaluateFieldAttempt({
    fieldKey: 'chief_complaint',
    value: '',
    attemptNumber: 3,
  });
  assert.equal(finalAttempt.nextState, 'incomplete_required');
  assert.equal(finalAttempt.result, 'manual_required');
  assert.equal(finalAttempt.manualRequired, true);
});

test('retry max attempts can be overridden', () => {
  const outcome = evaluateFieldAttempt({
    fieldKey: 'chief_complaint',
    value: '',
    attemptNumber: 2,
    maxAttemptsOverride: 2,
  });
  assert.equal(outcome.manualRequired, true);
  assert.equal(outcome.nextState, 'incomplete_required');
});
