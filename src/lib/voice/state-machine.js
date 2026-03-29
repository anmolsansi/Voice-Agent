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

/** @typedef {'idle' | 'listening' | 'transcribing' | 'confirming' | 'clarification' | 'manual_required' | 'error'} VoiceStateValue */

/**
 * @typedef {object} VoiceStateSnapshot
 * @property {VoiceStateValue} status
 * @property {string | null} transcript
 * @property {string | null} confirmationText
 * @property {string | null} clarificationPrompt
 * @property {string | null} fallbackReason
 * @property {string | null} error
 */

/**
 * @typedef {object} VoiceStateEvent
 * @property {string} type
 * @property {string} [transcript]
 * @property {string} [confirmationText]
 * @property {string} [clarificationPrompt]
 * @property {string} [reason]
 * @property {string} [error]
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
 * @returns {VoiceStateSnapshot}
 */
export function createInitialVoiceState() {
  return {
    status: VOICE_STATES.IDLE,
    transcript: null,
    confirmationText: null,
    clarificationPrompt: null,
    fallbackReason: null,
    error: null,
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
 *   CONFIRMATION_ACCEPTED        -> confirming => idle
 *   CONFIRMATION_REJECTED        -> confirming => clarification
 *   CLARIFICATION_REQUESTED      -> clarification => listening
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

    case 'STOP':
    case 'RESET':
      return moveTo(currentState, VOICE_STATES.IDLE, {
        transcript: null,
        confirmationText: null,
        clarificationPrompt: null,
        fallbackReason: null,
        error: null,
      });

    case 'TRANSCRIPT_RECEIVED':
      return moveTo(currentState, VOICE_STATES.TRANSCRIBING, {
        transcript: event.transcript ?? currentState.transcript,
        confirmationText: null,
        clarificationPrompt: null,
        error: null,
      });

    case 'TRANSCRIPTION_COMPLETED':
      return moveTo(currentState, VOICE_STATES.CONFIRMING, {
        transcript: event.transcript ?? currentState.transcript,
        confirmationText: event.confirmationText ?? event.transcript ?? currentState.transcript,
        clarificationPrompt: null,
        error: null,
      });

    case 'TRANSCRIPTION_UNCLEAR':
      return moveTo(currentState, VOICE_STATES.CLARIFICATION, {
        transcript: event.transcript ?? currentState.transcript,
        clarificationPrompt:
          event.clarificationPrompt ?? 'I did not catch that. Please try again.',
        confirmationText: null,
      });

    case 'CONFIRMATION_ACCEPTED':
      return moveTo(currentState, VOICE_STATES.IDLE, {
        confirmationText: event.confirmationText ?? currentState.confirmationText,
        clarificationPrompt: null,
        error: null,
      });

    case 'CONFIRMATION_REJECTED':
      return moveTo(currentState, VOICE_STATES.CLARIFICATION, {
        clarificationPrompt:
          event.clarificationPrompt ?? 'Let\'s try that again.',
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
 * @returns {{ status: VoiceStateValue, ui: { label: string, canUseMicrophone: boolean, canUseManualFallback: boolean } }}
 */
export function getVoiceUiState(state) {
  return {
    status: state.status,
    ui: VOICE_STATE_UI[state.status],
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
