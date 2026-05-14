import { classifyIntent } from "../intents/intent-map.mjs";

const terminalStates = new Set(["completion", "termination"]);

export function createInitialConversationState(callSessionId, options = {}) {
  return {
    callSessionId,
    currentState: "greeting",
    previousState: undefined,
    retryCount: 0,
    maxRetries: options.maxRetries ?? 2,
    identityConfirmed: false,
    consentGranted: false,
    capturedSlots: {},
    disposition: undefined
  };
}

export function isTerminalConversationState(state) {
  return terminalStates.has(state.currentState);
}

export function advanceConversation(state, input = {}) {
  const detection = input.intent
    ? { intent: input.intent, confidence: input.confidence ?? 1 }
    : classifyIntent(input.text || "");
  const next = {
    ...state,
    previousState: state.currentState,
    capturedSlots: { ...state.capturedSlots }
  };

  if (detection.intent === "repeat") {
    return withTransition(next, state.currentState, detection);
  }

  if (detection.intent === "opt_out" || detection.intent === "refuse_consent") {
    next.consentGranted = false;
    next.disposition = "opted_out";
    return withTransition(next, "termination", detection);
  }

  if (detection.intent === "urgent_symptom") {
    next.capturedSlots.symptoms = input.text;
    next.capturedSlots.severity = "urgent";
    next.disposition = "escalated";
    return withTransition(next, "escalation", detection);
  }

  if (detection.intent === "callback_request" || detection.intent === "transfer") {
    next.capturedSlots.callbackRequested = true;
    next.disposition = "callback_requested";
    return withTransition(next, "callback_request", detection);
  }

  if (detection.intent === "unknown" && state.currentState !== "greeting") {
    next.retryCount += 1;
    if (next.retryCount > next.maxRetries) {
      next.disposition = "abandoned";
      return withTransition(next, "termination", detection);
    }
    return withTransition(next, "clarification", detection);
  }

  next.retryCount = 0;

  switch (state.currentState) {
    case "greeting":
      return withTransition(next, "identity_verification", detection);
    case "identity_verification":
      if (["affirm", "affirm_consent"].includes(detection.intent)) {
        next.identityConfirmed = true;
        return withTransition(next, "consent", detection);
      }
      return withTransition(next, "clarification", detection);
    case "consent":
      if (["affirm", "affirm_consent"].includes(detection.intent)) {
        next.consentGranted = true;
        return withTransition(next, "question_sequence", detection);
      }
      next.disposition = "opted_out";
      return withTransition(next, "termination", detection);
    case "question_sequence":
    case "clarification":
      if (detection.intent === "routine_status") {
        next.capturedSlots.severity = "none";
        next.disposition = "completed";
        return withTransition(next, "summary", detection);
      }
      if (detection.intent === "symptom_report") {
        next.capturedSlots.symptoms = input.text;
        next.capturedSlots.severity = "moderate";
        next.disposition = "callback_requested";
        return withTransition(next, "callback_request", detection);
      }
      return withTransition(next, "question_sequence", detection);
    case "callback_request":
      next.capturedSlots.preferredCallbackWindow = input.text || undefined;
      return withTransition(next, "summary", detection);
    case "escalation":
    case "summary":
      return withTransition(next, "completion", detection);
    default:
      return withTransition(next, "termination", detection);
  }
}

function withTransition(state, currentState, detection) {
  return {
    state: {
      ...state,
      currentState
    },
    intent: detection.intent,
    confidence: detection.confidence,
    disposition: state.disposition,
    isTerminal: terminalStates.has(currentState)
  };
}
