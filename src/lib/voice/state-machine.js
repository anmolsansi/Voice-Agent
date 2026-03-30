/**
 * Voice interaction state model draft for CheckIn Care.
 *
 * This is a pure UI-friendly state machine definition for the future patient
 * intake frontend. It intentionally does NOT orchestrate microphone, STT, or
 * TTS providers. Instead, it defines:
 *   - the supported voice states
 *   - allowed transitions between states
 *   - a small reducer to drive state changes from app events
 *
 * Product/UI code can keep a single voice session object in component state or
 * a store, dispatch events into `transitionVoiceState()`, and render from the
 * returned snapshot.
 */

import {
  VOICE_FIELD_ORDER,
  VOICE_INTAKE_SECTIONS,
  getNextVoiceFieldKey,
  getSectionForVoiceField,
  getVoicePrompt,
} from './intake-config.js';
import { extractFieldValue } from './extraction.js';

/** @typedef {'idle' | 'listening' | 'transcribing' | 'confirming' | 'clarification' | 'manual_required' | 'error'} VoiceStateValue */

/**
 * @typedef {object} VoiceStateSnapshot
 * @property {VoiceStateValue} status
 * @property {string | null} transcript
 * @property {string | null} confirmationText
 * @property {string | null} clarificationPrompt
 * @property {string | null} fallbackReason
 * @property {string | null} error
 * @property {string | null} activeSection
 * @property {string | null} activeFieldKey
 * @property {string | null} promptText
 * @property {Record<string, string | number | boolean | null>} collectedFields
 */

/**
 * @typedef {object} VoiceStateEvent
 * @property {string} type
 * @property {string} [transcript]
 * @property {string} [confirmationText]
 * @property {string} [clarificationPrompt]
 * @property {string} [reason]
 * @property {string} [error]
 * @property {string} [fieldKey]
 * @property {string} [sectionKey]
 */

export const VOICE_STATES = Object.freeze({
  IDLE: 'idle',
  LISTENING: 'listening',
  TRANSCRIBING: 'transcribing',
  CONFIRMING: 'confirming',
  CLARIFICATION: 'clarification',
  MANUAL_REQUIRED: 'manual_required',
  ERROR: 'error',
});

/**
 * Allowed transitions for guardrails, docs, and later UI wiring.
 */
export const VOICE_STATE_TRANSITIONS = Object.freeze({
  [VOICE_STATES.IDLE]: [
    VOICE_STATES.LISTENING,
    VOICE_STATES.MANUAL_REQUIRED,
    VOICE_STATES.ERROR,
  ],
  [VOICE_STATES.LISTENING]: [
    VOICE_STATES.TRANSCRIBING,
    VOICE_STATES.MANUAL_REQUIRED,
    VOICE_STATES.ERROR,
    VOICE_STATES.IDLE,
  ],
  [VOICE_STATES.TRANSCRIBING]: [
    VOICE_STATES.CONFIRMING,
    VOICE_STATES.CLARIFICATION,
    VOICE_STATES.MANUAL_REQUIRED,
    VOICE_STATES.ERROR,
    VOICE_STATES.IDLE,
  ],
  [VOICE_STATES.CONFIRMING]: [
    VOICE_STATES.LISTENING,
    VOICE_STATES.IDLE,
    VOICE_STATES.CLARIFICATION,
    VOICE_STATES.MANUAL_REQUIRED,
    VOICE_STATES.ERROR,
  ],
  [VOICE_STATES.CLARIFICATION]: [
    VOICE_STATES.LISTENING,
    VOICE_STATES.MANUAL_REQUIRED,
    VOICE_STATES.ERROR,
    VOICE_STATES.IDLE,
  ],
  [VOICE_STATES.MANUAL_REQUIRED]: [
    VOICE_STATES.IDLE,
    VOICE_STATES.LISTENING,
  ],
  [VOICE_STATES.ERROR]: [
    VOICE_STATES.IDLE,
    VOICE_STATES.LISTENING,
    VOICE_STATES.MANUAL_REQUIRED,
  ],
});

/**
 * UI copy hooks for later patient frontend integration.
 * These are defaults only; screens can override them.
 */
export const VOICE_STATE_UI = Object.freeze({
  [VOICE_STATES.IDLE]: {
    label: 'Ready',
    canUseMicrophone: false,
    canUseManualFallback: true,
  },
  [VOICE_STATES.LISTENING]: {
    label: 'Listening…',
    canUseMicrophone: true,
    canUseManualFallback: true,
  },
  [VOICE_STATES.TRANSCRIBING]: {
    label: 'Transcribing…',
    canUseMicrophone: false,
    canUseManualFallback: true,
  },
  [VOICE_STATES.CONFIRMING]: {
    label: 'Please confirm',
    canUseMicrophone: true,
    canUseManualFallback: true,
  },
  [VOICE_STATES.CLARIFICATION]: {
    label: 'Need clarification',
    canUseMicrophone: true,
    canUseManualFallback: true,
  },
  [VOICE_STATES.MANUAL_REQUIRED]: {
    label: 'Continue manually',
    canUseMicrophone: false,
    canUseManualFallback: true,
  },
  [VOICE_STATES.ERROR]: {
    label: 'Voice unavailable',
    canUseMicrophone: false,
    canUseManualFallback: true,
  },
});

/**
 * @param {{ sectionKey?: string | null, fieldKey?: string | null }} [options]
 * @returns {VoiceStateSnapshot}
 */
export function createInitialVoiceState(options = {}) {
  const initialFieldKey = resolveInitialFieldKey(options);
  const prompt = initialFieldKey ? getVoicePrompt(initialFieldKey) : null;

  return {
    status: VOICE_STATES.IDLE,
    transcript: null,
    confirmationText: null,
    clarificationPrompt: null,
    fallbackReason: null,
    error: null,
    activeSection: prompt?.sectionKey ?? null,
    activeFieldKey: initialFieldKey,
    promptText: prompt?.promptText ?? null,
    collectedFields: {},
  };
}

/**
 * @param {VoiceStateValue} from
 * @param {VoiceStateValue} to
 */
export function isValidVoiceTransition(from, to) {
  return Boolean(VOICE_STATE_TRANSITIONS[from]?.includes(to));
}

/**
 * Pure state transition helper.
 *
 * Event contract (draft):
 *   START_LISTENING              -> idle|confirming|clarification|error|manual_required => listening
 *   STOP                         -> any active voice state => idle
 *   TRANSCRIPT_RECEIVED          -> listening => transcribing
 *   TRANSCRIPTION_COMPLETED      -> transcribing => confirming
 *   TRANSCRIPTION_UNCLEAR        -> transcribing => clarification
 *   CONFIRMATION_ACCEPTED        -> confirming => idle (and advance to next field)
 *   CONFIRMATION_REJECTED        -> confirming => clarification
 *   CLARIFICATION_REQUESTED      -> clarification => listening
 *   SET_ACTIVE_FIELD             -> any => same status with new field/prompt context
 *   ADVANCE_FIELD                -> any => same status with next field/prompt context
 *   MANUAL_FALLBACK_REQUESTED    -> many => manual_required
 *   ERROR_OCCURRED               -> many => error
 *   RESET                        -> any => idle
 *
 * @param {VoiceStateSnapshot} currentState
 * @param {VoiceStateEvent} event
 * @returns {VoiceStateSnapshot}
 */
export function transitionVoiceState(currentState, event) {
  switch (event.type) {
    case 'START_LISTENING':
      return moveTo(currentState, VOICE_STATES.LISTENING);

    case 'SET_ACTIVE_FIELD':
      return applyPromptContext(currentState, event.fieldKey ?? getFieldKeyForSection(event.sectionKey));

    case 'ADVANCE_FIELD':
      return applyPromptContext(currentState, getNextVoiceFieldKey(currentState.activeFieldKey));

    case 'STOP':
    case 'RESET': {
      const resetState = createInitialVoiceState({
        fieldKey: currentState.activeFieldKey ?? VOICE_FIELD_ORDER[0] ?? null,
      });

      return moveTo(currentState, VOICE_STATES.IDLE, {
        ...resetState,
        collectedFields: currentState.collectedFields,
      });
    }

    case 'TRANSCRIPT_RECEIVED':
      return moveTo(currentState, VOICE_STATES.TRANSCRIBING, {
        transcript: event.transcript ?? currentState.transcript,
        confirmationText: null,
        clarificationPrompt: null,
        error: null,
      });

    case 'TRANSCRIPTION_COMPLETED': {
      const transcript = event.transcript ?? currentState.transcript;
      const extraction = currentState.activeFieldKey ? extractFieldValue(currentState.activeFieldKey, transcript) : null;
      const prompt = currentState.activeFieldKey ? getVoicePrompt(currentState.activeFieldKey) : null;

      if (!extraction || extraction.value == null) {
        return moveTo(currentState, VOICE_STATES.CLARIFICATION, {
          transcript,
          confirmationText: null,
          clarificationPrompt:
            event.clarificationPrompt ?? prompt?.clarificationPrompt ?? 'I did not catch that. Please try again.',
          error: null,
        });
      }

      return moveTo(currentState, VOICE_STATES.CONFIRMING, {
        transcript,
        confirmationText:
          event.confirmationText ?? buildConfirmationText(currentState.activeFieldKey, extraction.value),
        clarificationPrompt: null,
        collectedFields: {
          ...currentState.collectedFields,
          [currentState.activeFieldKey]: extraction.value,
        },
        error: null,
      });
    }

    case 'TRANSCRIPTION_UNCLEAR':
      return moveTo(currentState, VOICE_STATES.CLARIFICATION, {
        transcript: event.transcript ?? currentState.transcript,
        clarificationPrompt:
          event.clarificationPrompt
          ?? getVoicePrompt(currentState.activeFieldKey)?.clarificationPrompt
          ?? 'I did not catch that. Please try again.',
        confirmationText: null,
      });

    case 'CONFIRMATION_ACCEPTED': {
      const nextState = applyPromptContext(currentState, getNextVoiceFieldKey(currentState.activeFieldKey));
      return moveTo(nextState, VOICE_STATES.IDLE, {
        confirmationText: event.confirmationText ?? currentState.confirmationText,
        clarificationPrompt: null,
        error: null,
      });
    }

    case 'CONFIRMATION_REJECTED':
      return moveTo(currentState, VOICE_STATES.CLARIFICATION, {
        clarificationPrompt:
          event.clarificationPrompt
          ?? getVoicePrompt(currentState.activeFieldKey)?.clarificationPrompt
          ?? 'Let\'s try that again.',
      });

    case 'CLARIFICATION_REQUESTED':
      return moveTo(currentState, VOICE_STATES.LISTENING, {
        clarificationPrompt: event.clarificationPrompt ?? currentState.clarificationPrompt,
        error: null,
      });

    case 'MANUAL_FALLBACK_REQUESTED':
      return moveTo(currentState, VOICE_STATES.MANUAL_REQUIRED, {
        fallbackReason: event.reason ?? 'voice_unavailable',
        error: null,
      });

    case 'ERROR_OCCURRED':
      return moveTo(currentState, VOICE_STATES.ERROR, {
        error: event.error ?? 'Unknown voice error',
      });

    default:
      return currentState;
  }
}

/**
 * @param {VoiceStateSnapshot} state
 * @returns {{ status: VoiceStateValue, ui: { label: string, canUseMicrophone: boolean, canUseManualFallback: boolean }, activeSection: string | null, activeFieldKey: string | null, promptText: string | null }}
 */
export function getVoiceUiState(state) {
  return {
    status: state.status,
    ui: VOICE_STATE_UI[state.status],
    activeSection: state.activeSection,
    activeFieldKey: state.activeFieldKey,
    promptText: state.promptText,
  };
}

/**
 * @param {VoiceStateSnapshot} currentState
 * @param {VoiceStateValue} nextStatus
 * @param {Partial<VoiceStateSnapshot>} [patch]
 * @returns {VoiceStateSnapshot}
 */
function moveTo(currentState, nextStatus, patch = {}) {
  if (!isValidVoiceTransition(currentState.status, nextStatus) && currentState.status !== nextStatus) {
    return currentState;
  }

  return {
    ...currentState,
    ...patch,
    status: nextStatus,
  };
}

function resolveInitialFieldKey(options) {
  if (options.fieldKey && getVoicePrompt(options.fieldKey)) return options.fieldKey;
  if (options.sectionKey) return getFieldKeyForSection(options.sectionKey);
  return VOICE_FIELD_ORDER[0] ?? null;
}

function getFieldKeyForSection(sectionKey) {
  return VOICE_INTAKE_SECTIONS.find((section) => section.key === sectionKey)?.fieldKeys[0] ?? null;
}

function applyPromptContext(state, fieldKey) {
  const prompt = fieldKey ? getVoicePrompt(fieldKey) : null;
  const section = fieldKey ? getSectionForVoiceField(fieldKey) : null;

  return {
    ...state,
    activeSection: section?.key ?? null,
    activeFieldKey: fieldKey ?? null,
    promptText: prompt?.promptText ?? null,
    clarificationPrompt: prompt?.clarificationPrompt ?? state.clarificationPrompt,
  };
}

function buildConfirmationText(fieldKey, value) {
  const prompt = getVoicePrompt(fieldKey);
  const label = prompt?.promptText ?? fieldKey;
  return `I heard ${String(value)} for ${label}`;
}
