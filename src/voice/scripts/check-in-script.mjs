export const checkInScript = {
  greeting:
    "Hello {{firstName}}, this is CheckIn Care calling for your scheduled {{programName}} check-in.",
  identity_verification: "Am I speaking with {{firstName}} {{lastName}}?",
  consent: "Do I have your permission to continue with this brief check-in?",
  question_sequence:
    "Since your last check-in, have you had any new symptoms, medication concerns, or need for a callback?",
  clarification: "I am sorry, I did not catch that. Could you answer in a few words?",
  callback_request: "I can flag this for the care team. Is there a preferred time for a callback?",
  escalation:
    "I cannot provide medical advice. I will flag this for urgent follow-up. If this may be an emergency, please call emergency services now.",
  summary: "Thank you. I have recorded your check-in outcome for the care team.",
  completion: "That is all for today. Goodbye.",
  termination: "I will stop this check-in now. Goodbye."
};

export function renderScriptLine(state, context = {}) {
  const template = checkInScript[state] || checkInScript.clarification;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => context[key] || "");
}
