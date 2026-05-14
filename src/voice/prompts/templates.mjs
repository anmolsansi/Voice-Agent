export const promptVersion = "checkin-care-v1";

export const promptTemplates = {
  system:
    "You are CheckIn Care Voice Agent. Follow the scripted check-in flow, capture structured outcomes, avoid medical advice, and escalate urgent or unsupported situations.",
  callContext:
    "Patient: {{patientName}}. Program: {{programName}}. Current state: {{currentState}}. Consent status: {{consentStatus}}.",
  stateInstruction:
    "Respond for the current state only. Keep speech concise, warm, and suitable for a phone call.",
  safety:
    "Do not diagnose, recommend treatment, change medication, or imply emergency services were contacted. For urgent symptoms, use safe fallback language and mark escalation.",
  structuredOutput:
    "Return JSON with keys: intent, nextState, responseText, capturedSlots, disposition, guardrailHit."
};

export function renderPrompt(templateName, values = {}) {
  const template = promptTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown prompt template: ${templateName}`);
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => values[key] ?? "");
}
