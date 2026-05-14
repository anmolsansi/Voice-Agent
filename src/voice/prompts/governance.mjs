import { promptVersion } from "./templates.mjs";

export function createPromptReviewRecord({ fixtureId, expected, actual, reviewer = "system" }) {
  return {
    id: `prompt-review-${fixtureId}-${promptVersion}`,
    promptVersion,
    fixtureId,
    reviewer,
    passed: expected === actual,
    expected,
    actual,
    reviewedAt: new Date().toISOString()
  };
}

export function validateStructuredModelOutput(output) {
  const required = ["intent", "nextState", "responseText", "capturedSlots", "disposition", "guardrailHit"];
  const missing = required.filter((key) => !(key in output));
  return { valid: missing.length === 0, missing };
}
