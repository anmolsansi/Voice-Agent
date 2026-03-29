const { randomUUID } = require('crypto');
const { intakeSessionStore } = require('./session-store');

const INTAKE_SOURCE_MODES = new Set(['manual', 'voice', 'hybrid']);
const FIELD_WRITE_SOURCES = new Set(['manual', 'voice', 'staff']);
const COMPLETION_STATES = {
  EMPTY: 'empty',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  INCOMPLETE_REQUIRED: 'incomplete_required',
};

const SECTION_DEFINITIONS = [
  {
    key: 'demographics',
    label: 'Demographics',
    requiredFields: [
      'patient.firstName',
      'patient.lastName',
      'patient.dateOfBirth',
      'patient.sexAtBirth',
      'patient.phone',
    ],
    fields: [
      'patient.firstName',
      'patient.lastName',
      'patient.dateOfBirth',
      'patient.sexAtBirth',
      'patient.genderIdentity',
      'patient.phone',
      'patient.email',
      'patient.addressLine1',
      'patient.addressLine2',
      'patient.city',
      'patient.state',
      'patient.postalCode',
      'patient.preferredLanguage',
      'patient.sexAtBirthSelfDescribe',
    ],
  },
  {
    key: 'visit_reason',
    label: 'Visit reason',
    requiredFields: ['visit.chiefComplaint'],
    fields: [
      'visit.chiefComplaint',
      'visit.symptomDuration',
      'visit.painPresent',
      'visit.painScore',
      'visit.feverPresent',
      'visit.injuryRelated',
      'visit.workRelatedInjury',
    ],
  },
  {
    key: 'consent',
    label: 'Consent',
    requiredFields: [
      'consent.treatmentConsent',
      'consent.hipaaAcknowledgment',
      'consent.signatureName',
      'consent.signedAt',
    ],
    fields: [
      'consent.treatmentConsent',
      'consent.hipaaAcknowledgment',
      'consent.financialResponsibility',
      'consent.signatureName',
      'consent.signedAt',
    ],
  },
];

const FIELD_DEFINITIONS = {
  'patient.firstName': { type: 'string', required: true },
  'patient.lastName': { type: 'string', required: true },
  'patient.dateOfBirth': { type: 'date', required: true },
  'patient.sexAtBirth': {
    type: 'enum',
    required: true,
    allowedValues: ['female', 'male', 'intersex', 'prefer_not_to_say', 'self_describe'],
  },
  'patient.genderIdentity': { type: 'string', required: false },
  'patient.phone': { type: 'phone', required: true },
  'patient.email': { type: 'email', required: false },
  'patient.addressLine1': { type: 'string', required: false },
  'patient.addressLine2': { type: 'string', required: false },
  'patient.city': { type: 'string', required: false },
  'patient.state': { type: 'string', required: false },
  'patient.postalCode': { type: 'string', required: false },
  'patient.preferredLanguage': { type: 'string', required: false },
  'patient.sexAtBirthSelfDescribe': {
    type: 'string',
    required: false,
    dependsOn: { fieldKey: 'patient.sexAtBirth', value: 'self_describe' },
  },
  'visit.chiefComplaint': { type: 'string', required: true, maxLength: 500 },
  'visit.symptomDuration': { type: 'string', required: false },
  'visit.painPresent': { type: 'boolean', required: false },
  'visit.painScore': {
    type: 'integer',
    required: false,
    dependsOn: { fieldKey: 'visit.painPresent', value: true },
    min: 0,
    max: 10,
  },
  'visit.feverPresent': { type: 'boolean', required: false },
  'visit.injuryRelated': { type: 'boolean', required: false },
  'visit.workRelatedInjury': {
    type: 'boolean',
    required: false,
    dependsOn: { fieldKey: 'visit.injuryRelated', value: true },
  },
  'consent.treatmentConsent': { type: 'booleanTrue', required: true },
  'consent.hipaaAcknowledgment': { type: 'booleanTrue', required: true },
  'consent.financialResponsibility': { type: 'boolean', required: false },
  'consent.signatureName': { type: 'string', required: true },
  'consent.signedAt': { type: 'datetime', required: true, systemGenerated: true },
};

const FIELD_TO_SECTION = Object.fromEntries(
  SECTION_DEFINITIONS.flatMap((section) => section.fields.map((fieldKey) => [fieldKey, section])),
);

function buildInitialSections() {
  return SECTION_DEFINITIONS.map((section) => ({
    key: section.key,
    label: section.label,
    completionState: COMPLETION_STATES.EMPTY,
    requiredFields: section.requiredFields.slice(),
    incompleteRequiredFields: [],
  }));
}

function getTotalFieldCount() {
  return SECTION_DEFINITIONS.reduce((total, section) => total + section.fields.length, 0);
}

function createPublicSessionId() {
  return `intake_${randomUUID()}`;
}

function createIntakeSession(input = {}) {
  const sourceMode = input.sourceMode || 'manual';

  if (!INTAKE_SOURCE_MODES.has(sourceMode)) {
    const error = new Error('sourceMode must be one of: manual, voice, hybrid.');
    error.code = 'INVALID_SOURCE_MODE';
    throw error;
  }

  const now = new Date().toISOString();
  const session = {
    id: randomUUID(),
    publicSessionId: createPublicSessionId(),
    status: 'active',
    sourceMode,
    startedAt: now,
    updatedAt: now,
    expiresAt: null,
    submittedAt: null,
    completionSummary: {
      totalFields: getTotalFieldCount(),
      completedFields: 0,
      incompleteRequiredFields: 0,
    },
    sections: buildInitialSections(),
    fields: {},
  };

  intakeSessionStore.save(session);
  return serializeSession(session);
}

function loadIntakeSessionByPublicSessionId(publicSessionId) {
  const normalizedPublicSessionId =
    typeof publicSessionId === 'string' ? publicSessionId.trim() : '';

  if (!normalizedPublicSessionId) {
    throw createInputError('publicSessionId is required.', 'INVALID_PUBLIC_SESSION_ID');
  }

  const session = intakeSessionStore.getByPublicSessionId(normalizedPublicSessionId);
  if (!session) {
    const error = new Error('Intake session not found.');
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  return serializeSession(session);
}

function saveFieldValue(input = {}) {
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim() : '';
  const fieldKey = typeof input.fieldKey === 'string' ? input.fieldKey.trim() : '';
  const source = input.source;

  if (!sessionId) {
    throw createInputError('sessionId is required.', 'INVALID_SESSION_ID');
  }

  if (!fieldKey || !FIELD_DEFINITIONS[fieldKey]) {
    throw createInputError('fieldKey must match a supported intake field.', 'INVALID_FIELD_KEY');
  }

  if (!FIELD_WRITE_SOURCES.has(source)) {
    throw createInputError('source must be one of: manual, voice, staff.', 'INVALID_SOURCE');
  }

  const session = intakeSessionStore.get(sessionId);
  if (!session) {
    const error = new Error('Intake session not found.');
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  const now = new Date().toISOString();
  const normalizedValue = normalizeValue(fieldKey, input.value, session);
  const fieldState = {
    fieldKey,
    value: normalizedValue,
    displayValue: buildDisplayValue(fieldKey, normalizedValue),
    completionState: COMPLETION_STATES.EMPTY,
    lastUpdatedAt: now,
    lastUpdatedBySource: source,
  };

  session.fields[fieldKey] = fieldState;

  if (fieldKey === 'consent.signatureName' && typeof normalizedValue === 'string' && normalizedValue) {
    session.fields['consent.signedAt'] = {
      fieldKey: 'consent.signedAt',
      value: now,
      displayValue: now,
      completionState: COMPLETION_STATES.COMPLETE,
      lastUpdatedAt: now,
      lastUpdatedBySource: 'system',
    };
  }

  if (fieldKey === 'patient.sexAtBirth' && normalizedValue !== 'self_describe') {
    clearField(session, 'patient.sexAtBirthSelfDescribe');
  }

  if (fieldKey === 'visit.painPresent' && normalizedValue !== true) {
    clearField(session, 'visit.painScore');
  }

  if (fieldKey === 'visit.injuryRelated' && normalizedValue !== true) {
    clearField(session, 'visit.workRelatedInjury');
  }

  const validationByField = recomputeSessionState(session);
  session.updatedAt = now;
  intakeSessionStore.save(session);

  return {
    sessionId: session.id,
    field: session.fields[fieldKey],
    validation: validationByField[fieldKey],
    section: session.sections.find((section) => section.key === FIELD_TO_SECTION[fieldKey].key),
    sessionStatus: session.status,
  };
}

function recomputeSessionState(session) {
  const validationByField = {};
  let completedFields = 0;
  let incompleteRequiredFields = 0;

  for (const fieldKey of Object.keys(FIELD_DEFINITIONS)) {
    const fieldState = session.fields[fieldKey];
    const validation = validateFieldValue(fieldKey, fieldState ? fieldState.value : null, session);
    validationByField[fieldKey] = validation;

    const completionState = deriveCompletionState(fieldState ? fieldState.value : null, validation);

    if (fieldState) {
      fieldState.completionState = completionState;
      fieldState.displayValue = buildDisplayValue(fieldKey, fieldState.value);
    }

    if (completionState === COMPLETION_STATES.COMPLETE) {
      completedFields += 1;
    }

    if (validation.blocking) {
      incompleteRequiredFields += 1;
    }
  }

  session.sections = SECTION_DEFINITIONS.map((section) => {
    const sectionValidations = section.fields.map((fieldKey) => ({
      fieldKey,
      validation: validationByField[fieldKey],
      field: session.fields[fieldKey],
    }));
    const sectionCompletedFields = sectionValidations.filter(
      ({ field }) => field && field.completionState === COMPLETION_STATES.COMPLETE,
    ).length;
    const sectionIncompleteRequiredFields = sectionValidations
      .filter(({ validation }) => validation.blocking)
      .map(({ fieldKey }) => fieldKey);

    return {
      key: section.key,
      label: section.label,
      requiredFields: section.requiredFields.slice(),
      incompleteRequiredFields: sectionIncompleteRequiredFields,
      completionState: deriveSectionCompletionState(
        section.fields.length,
        sectionCompletedFields,
        sectionIncompleteRequiredFields.length,
      ),
    };
  });

  session.completionSummary = {
    totalFields: getTotalFieldCount(),
    completedFields,
    incompleteRequiredFields,
  };
  session.status = 'active';

  return validationByField;
}

function deriveSectionCompletionState(totalFields, completedFields, incompleteRequiredFields) {
  if (completedFields === 0) {
    return incompleteRequiredFields > 0 ? COMPLETION_STATES.INCOMPLETE_REQUIRED : COMPLETION_STATES.EMPTY;
  }

  if (incompleteRequiredFields > 0) {
    return COMPLETION_STATES.INCOMPLETE_REQUIRED;
  }

  return completedFields === totalFields ? COMPLETION_STATES.COMPLETE : COMPLETION_STATES.IN_PROGRESS;
}

function deriveCompletionState(value, validation) {
  if (validation.blocking) {
    return COMPLETION_STATES.INCOMPLETE_REQUIRED;
  }

  if (isEmptyValue(value)) {
    return COMPLETION_STATES.EMPTY;
  }

  return validation.isValid ? COMPLETION_STATES.COMPLETE : COMPLETION_STATES.IN_PROGRESS;
}

function validateFieldValue(fieldKey, value, session) {
  const definition = FIELD_DEFINITIONS[fieldKey];
  const dependency = definition.dependsOn;

  if (dependency && !isDependencyActive(dependency, session)) {
    return validationResult(fieldKey, true, 'ok', null, false);
  }

  if (definition.required && isEmptyValue(value)) {
    return validationResult(fieldKey, false, 'required_missing', 'This field is required.', true);
  }

  if (!definition.required && isEmptyValue(value)) {
    return validationResult(fieldKey, true, 'ok', null, false);
  }

  switch (definition.type) {
    case 'string': {
      if (typeof value !== 'string' || !value.trim()) {
        return validationResult(fieldKey, false, 'invalid_value', 'Value must be a non-empty string.', Boolean(definition.required));
      }

      if (definition.maxLength && value.trim().length > definition.maxLength) {
        return validationResult(fieldKey, false, 'invalid_value', `Value must be ${definition.maxLength} characters or less.`, Boolean(definition.required));
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'date': {
      const date = new Date(value);
      if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
        return validationResult(fieldKey, false, 'invalid_format', 'Value must be a valid date.', Boolean(definition.required));
      }

      if (date.getTime() >= Date.now()) {
        return validationResult(fieldKey, false, 'invalid_value', 'Date of birth must be in the past.', true);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'datetime': {
      const date = new Date(value);
      if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
        return validationResult(fieldKey, false, 'invalid_format', 'Value must be a valid datetime.', Boolean(definition.required));
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'phone': {
      if (typeof value !== 'string' || !/^\+1\d{10}$/.test(value)) {
        return validationResult(fieldKey, false, 'invalid_format', 'Phone number must be in normalized +1XXXXXXXXXX format.', true);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'email': {
      if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return validationResult(fieldKey, false, 'invalid_format', 'Email address must be valid.', false);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'enum': {
      if (!definition.allowedValues.includes(value)) {
        return validationResult(fieldKey, false, 'invalid_value', 'Value must match an allowed option.', true);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'integer': {
      if (!Number.isInteger(value)) {
        return validationResult(fieldKey, false, 'invalid_format', 'Value must be an integer.', false);
      }

      if (value < definition.min || value > definition.max) {
        return validationResult(fieldKey, false, 'invalid_value', `Value must be between ${definition.min} and ${definition.max}.`, false);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'boolean': {
      if (typeof value !== 'boolean') {
        return validationResult(fieldKey, false, 'invalid_format', 'Value must be a boolean.', false);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    case 'booleanTrue': {
      if (value !== true) {
        return validationResult(fieldKey, false, 'invalid_value', 'This acknowledgment must be accepted.', true);
      }

      return validationResult(fieldKey, true, 'ok', null, false);
    }
    default:
      return validationResult(fieldKey, false, 'server_rejected', 'Unsupported field definition.', true);
  }
}

function normalizeValue(fieldKey, value) {
  if (value === null || value === undefined) {
    return null;
  }

  const definition = FIELD_DEFINITIONS[fieldKey];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (definition.type === 'phone') {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 10) {
        return `+1${digits}`;
      }
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
      }
    }

    return trimmed;
  }

  return value;
}

function buildDisplayValue(_fieldKey, value) {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function isDependencyActive(dependency, session) {
  return session.fields[dependency.fieldKey] && session.fields[dependency.fieldKey].value === dependency.value;
}

function isEmptyValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && !value.trim());
}

function clearField(session, fieldKey) {
  delete session.fields[fieldKey];
}

function serializeSession(session) {
  return {
    id: session.id,
    publicSessionId: session.publicSessionId,
    status: session.status,
    sourceMode: session.sourceMode,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    submittedAt: session.submittedAt,
    completionSummary: session.completionSummary,
    sections: session.sections,
    fields: session.fields,
  };
}

function validationResult(fieldKey, isValid, code, message, blocking) {
  return {
    fieldKey,
    isValid,
    code,
    message,
    blocking,
  };
}

function createInputError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

module.exports = {
  createIntakeSession,
  intakeSessionStore,
  loadIntakeSessionByPublicSessionId,
  saveFieldValue,
  serializeSession,
};
