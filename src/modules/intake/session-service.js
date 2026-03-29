const { randomUUID } = require('crypto');
const { intakeSessionStore } = require('./session-store');

const INTAKE_SOURCE_MODES = new Set(['manual', 'voice', 'hybrid']);

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
    totalFields: 14,
  },
  {
    key: 'visit_reason',
    label: 'Visit reason',
    requiredFields: ['visit.chiefComplaint'],
    totalFields: 7,
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
    totalFields: 5,
  },
];

function buildInitialSections() {
  return SECTION_DEFINITIONS.map((section) => ({
    key: section.key,
    label: section.label,
    completionState: 'empty',
    requiredFields: section.requiredFields.slice(),
    incompleteRequiredFields: [],
  }));
}

function getTotalFieldCount() {
  return SECTION_DEFINITIONS.reduce((total, section) => total + section.totalFields, 0);
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
  };

  return intakeSessionStore.save(session);
}

module.exports = {
  createIntakeSession,
  intakeSessionStore,
};
