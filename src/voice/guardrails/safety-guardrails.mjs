const urgentPatterns = [/chest pain/i, /shortness of breath/i, /can't breathe/i, /fainted/i, /emergency/i, /severe pain/i];
const medicalAdvicePatterns = [/change .*medication/i, /change .*dose/i, /should i take/i, /diagnos/i, /treatment/i, /medication dose/i];

export function evaluateSafety(text = "") {
  const urgent = urgentPatterns.find((pattern) => pattern.test(text));
  if (urgent) {
    return {
      safe: false,
      action: "escalate",
      reason: "urgent_symptom",
      priority: "urgent",
      fallbackResponse:
        "I cannot provide medical advice. I will flag this for urgent follow-up. If this may be an emergency, please call emergency services now."
    };
  }
  const medicalAdvice = medicalAdvicePatterns.find((pattern) => pattern.test(text));
  if (medicalAdvice) {
    return {
      safe: false,
      action: "safe_fallback",
      reason: "unsupported_medical_advice",
      priority: "medium",
      fallbackResponse:
        "I cannot provide medical advice or medication instructions. I can flag this for the care team to review."
    };
  }
  return { safe: true, action: "continue", reason: undefined, priority: undefined };
}

export function createGuardrailHit({ callSessionId, transcriptTurnId, text, at = new Date().toISOString() }) {
  const result = evaluateSafety(text);
  if (result.safe) return undefined;
  return {
    id: `guardrail-${callSessionId}-${transcriptTurnId || at.replace(/[-:.TZ]/g, "")}`,
    callSessionId,
    transcriptTurnId,
    reason: result.reason,
    actionTaken: result.action,
    priority: result.priority,
    createdAt: at,
    fallbackResponse: result.fallbackResponse
  };
}
