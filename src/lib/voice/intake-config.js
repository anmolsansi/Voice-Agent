/**
 * Schema-driven voice intake field map for the frozen Sprint 1 MVP.
 */

export const VOICE_RESPONSE_TYPES = Object.freeze({
  NAME: 'name',
  DATE: 'date',
  SEX_AT_BIRTH: 'sexAtBirth',
  PHONE: 'phone',
  EMAIL: 'email',
  FREE_TEXT: 'freeText',
  YES_NO: 'yesNo',
  PAIN_SCORE: 'painScore',
  SIGNATURE_NAME: 'signatureName',
});

export const VOICE_INTAKE_SECTIONS = Object.freeze([
  {
    key: 'demographics',
    label: 'Demographics',
    fieldKeys: [
      'patient.firstName',
      'patient.lastName',
      'patient.dateOfBirth',
      'patient.sexAtBirth',
      'patient.phone',
      'patient.email',
    ],
  },
  {
    key: 'visit_reason',
    label: 'Visit reason',
    fieldKeys: [
      'visit.chiefComplaint',
      'visit.symptomDuration',
      'visit.feverPresent',
      'visit.injuryRelated',
      'visit.painPresent',
      'visit.painScore',
    ],
  },
  {
    key: 'consent',
    label: 'Consent',
    fieldKeys: [
      'consent.treatmentConsent',
      'consent.hipaaAcknowledgment',
      'consent.signatureName',
    ],
  },
]);

export const VOICE_PROMPT_MAP = Object.freeze({
  'patient.firstName': {
    fieldKey: 'patient.firstName',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.NAME,
    promptText: 'What is your first name?',
    clarificationPrompt: 'Please say your first name only.',
  },
  'patient.lastName': {
    fieldKey: 'patient.lastName',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.NAME,
    promptText: 'What is your last name?',
    clarificationPrompt: 'Please say your last name only.',
  },
  'patient.dateOfBirth': {
    fieldKey: 'patient.dateOfBirth',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.DATE,
    promptText: 'What is your date of birth?',
    clarificationPrompt: 'Please say your date of birth, for example March 5th 1988.',
  },
  'patient.sexAtBirth': {
    fieldKey: 'patient.sexAtBirth',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.SEX_AT_BIRTH,
    promptText: 'What sex were you assigned at birth?',
    clarificationPrompt: 'Please say female, male, intersex, prefer not to say, or self describe.',
  },
  'patient.phone': {
    fieldKey: 'patient.phone',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.PHONE,
    promptText: 'What is the best phone number to reach you?',
    clarificationPrompt: 'Please say your 10 digit phone number, including area code.',
  },
  'patient.email': {
    fieldKey: 'patient.email',
    sectionKey: 'demographics',
    responseType: VOICE_RESPONSE_TYPES.EMAIL,
    promptText: 'What is your email address? You can also say skip if you prefer not to provide one.',
    clarificationPrompt: 'Please say your email address clearly, or say skip.',
  },
  'visit.chiefComplaint': {
    fieldKey: 'visit.chiefComplaint',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.FREE_TEXT,
    promptText: 'What brings you in today?',
    clarificationPrompt: 'Please briefly describe what brings you in today.',
  },
  'visit.symptomDuration': {
    fieldKey: 'visit.symptomDuration',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.FREE_TEXT,
    promptText: 'How long has this been going on?',
    clarificationPrompt: 'Please tell me how long you have had these symptoms.',
  },
  'visit.feverPresent': {
    fieldKey: 'visit.feverPresent',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.YES_NO,
    promptText: 'Do you have a fever?',
    clarificationPrompt: 'Please say yes or no.',
  },
  'visit.injuryRelated': {
    fieldKey: 'visit.injuryRelated',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.YES_NO,
    promptText: 'Is this related to an injury?',
    clarificationPrompt: 'Please say yes or no.',
  },
  'visit.painPresent': {
    fieldKey: 'visit.painPresent',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.YES_NO,
    promptText: 'Are you having pain right now?',
    clarificationPrompt: 'Please say yes or no.',
  },
  'visit.painScore': {
    fieldKey: 'visit.painScore',
    sectionKey: 'visit_reason',
    responseType: VOICE_RESPONSE_TYPES.PAIN_SCORE,
    promptText: 'On a scale from 0 to 10, what is your pain level?',
    clarificationPrompt: 'Please say a number from 0 to 10.',
  },
  'consent.treatmentConsent': {
    fieldKey: 'consent.treatmentConsent',
    sectionKey: 'consent',
    responseType: VOICE_RESPONSE_TYPES.YES_NO,
    promptText: 'Do you consent to evaluation and treatment today?',
    clarificationPrompt: 'Please say yes or no.',
  },
  'consent.hipaaAcknowledgment': {
    fieldKey: 'consent.hipaaAcknowledgment',
    sectionKey: 'consent',
    responseType: VOICE_RESPONSE_TYPES.YES_NO,
    promptText: 'Do you acknowledge receipt or availability of the HIPAA privacy practices?',
    clarificationPrompt: 'Please say yes or no.',
  },
  'consent.signatureName': {
    fieldKey: 'consent.signatureName',
    sectionKey: 'consent',
    responseType: VOICE_RESPONSE_TYPES.SIGNATURE_NAME,
    promptText: 'Please say your full name as your signature.',
    clarificationPrompt: 'Please say your first and last name as your signature.',
  },
});

export const VOICE_FIELD_ORDER = Object.freeze(
  VOICE_INTAKE_SECTIONS.flatMap((section) => section.fieldKeys),
);

export function getVoicePrompt(fieldKey) {
  return VOICE_PROMPT_MAP[fieldKey] ?? null;
}

export function getVoiceFieldOrderForSection(sectionKey) {
  return VOICE_INTAKE_SECTIONS.find((section) => section.key === sectionKey)?.fieldKeys ?? [];
}

export function getNextVoiceFieldKey(currentFieldKey) {
  const index = VOICE_FIELD_ORDER.indexOf(currentFieldKey);
  if (index === -1) return VOICE_FIELD_ORDER[0] ?? null;

  return VOICE_FIELD_ORDER[index + 1] ?? null;
}

export function getSectionForVoiceField(fieldKey) {
  return VOICE_INTAKE_SECTIONS.find((section) => section.fieldKeys.includes(fieldKey)) ?? null;
}
