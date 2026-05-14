import { advanceConversation } from "../state-machine/conversation-state-machine.mjs";
import { renderScriptLine } from "../scripts/check-in-script.mjs";

export function createRealtimeSession({ callSessionId, conversationState, context = {} }) {
  return {
    callSessionId,
    conversationState,
    context,
    partialTranscript: "",
    turns: [],
    agentSpeaking: false
  };
}

export function handleRealtimeEvent(session, event) {
  const next = {
    ...session,
    turns: [...session.turns]
  };

  switch (event.type) {
    case "speech_start":
      if (next.agentSpeaking) {
        next.agentSpeaking = false;
        next.bargeIn = true;
      }
      return { session: next, action: "listening" };
    case "partial_transcript":
      next.partialTranscript = event.text || "";
      return { session: next, action: "partial_transcript" };
    case "final_transcript": {
      const startedAt = event.startedAt || new Date().toISOString();
      const endedAt = event.endedAt || startedAt;
      const result = advanceConversation(next.conversationState, {
        text: event.text,
        confidence: event.confidence
      });
      const patientTurn = {
        id: event.turnId || `${next.callSessionId}-turn-${next.turns.length + 1}`,
        callSessionId: next.callSessionId,
        speaker: "patient",
        text: event.text,
        confidence: event.confidence,
        intent: result.intent,
        stateBefore: next.conversationState.currentState,
        stateAfter: result.state.currentState,
        startedAt,
        endedAt
      };
      const responseText = renderScriptLine(result.state.currentState, next.context);
      const agentTurn = {
        id: `${patientTurn.id}-agent`,
        callSessionId: next.callSessionId,
        speaker: "agent",
        text: responseText,
        intent: "agent_response",
        stateBefore: result.state.previousState,
        stateAfter: result.state.currentState,
        startedAt: endedAt,
        endedAt
      };
      next.conversationState = result.state;
      next.partialTranscript = "";
      next.turns.push(patientTurn, agentTurn);
      next.agentSpeaking = true;
      return { session: next, action: "speak", responseText, result };
    }
    case "tts_complete":
      next.agentSpeaking = false;
      return { session: next, action: "idle" };
    case "silence_timeout": {
      const result = advanceConversation(next.conversationState, { intent: "unknown", confidence: 0 });
      next.conversationState = result.state;
      return { session: next, action: result.isTerminal ? "terminate" : "clarify", result };
    }
    case "call_end":
      next.endedAt = event.endedAt || new Date().toISOString();
      return { session: next, action: "ended" };
    default:
      return { session: next, action: "ignored" };
  }
}
