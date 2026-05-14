export const intentMap = {
  affirm: ["yes", "yeah", "correct", "that is right", "this is"],
  deny: ["no", "not right", "incorrect"],
  affirm_consent: ["i can continue", "i agree", "you can continue", "yes continue"],
  refuse_consent: ["i do not consent", "do not continue", "not now"],
  routine_status: ["no new symptoms", "i am okay", "nothing new", "doing fine"],
  symptom_report: ["pain", "dizzy", "nausea", "swelling", "concern"],
  urgent_symptom: ["chest pain", "shortness of breath", "can't breathe", "fainted", "emergency"],
  callback_request: ["call me back", "talk to someone", "callback", "follow up"],
  repeat: ["repeat", "say that again", "what did you say"],
  opt_out: ["stop calling", "opt out", "remove me", "do not call"],
  transfer: ["human", "representative", "nurse", "clinician"],
  unknown: []
};

export function classifyIntent(text = "") {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("no new symptoms") ||
    normalized.includes("do not need a callback") ||
    normalized.includes("don't need a callback")
  ) {
    return { intent: "routine_status", confidence: 0.96 };
  }

  for (const intent of ["urgent_symptom", "opt_out", "callback_request", "refuse_consent", "affirm_consent"]) {
    if (intentMap[intent].some((phrase) => normalized.includes(phrase))) {
      return { intent, confidence: 0.95 };
    }
  }

  for (const [intent, phrases] of Object.entries(intentMap)) {
    if (intent === "unknown") {
      continue;
    }
    if (phrases.some((phrase) => normalized.includes(phrase))) {
      return { intent, confidence: 0.82 };
    }
  }

  return { intent: "unknown", confidence: 0.25 };
}
