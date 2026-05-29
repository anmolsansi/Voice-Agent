export const metricDefinitions = {
  completionRate: {
    label: "Completion rate",
    formula: "completed check-ins / attempted calls",
    numerator: "check_in_completed events",
    denominator: "call_dialed events"
  },
  contactRate: {
    label: "Contact rate",
    formula: "answered calls / attempted calls",
    numerator: "call_answered events",
    denominator: "call_dialed events"
  },
  escalationRate: {
    label: "Escalation rate",
    formula: "unique escalated calls / attempted calls",
    numerator: "unique call_escalated call sessions",
    denominator: "call_dialed events"
  },
  averageCallDuration: {
    label: "Average call duration",
    formula: "sum completed call durations / calls with end timestamps",
    numerator: "durationSeconds metadata",
    denominator: "calls with measurable duration"
  },
  noAnswerRate: {
    label: "No-answer rate",
    formula: "no-answer calls / attempted calls",
    numerator: "call_no_answer events",
    denominator: "call_dialed events"
  },
  guardrailRate: {
    label: "Guardrail rate",
    formula: "unique guardrail-hit calls / attempted calls",
    numerator: "unique guardrail_hit call sessions",
    denominator: "call_dialed events"
  }
};

export const aggregationContract = {
  request: {
    range: "7d | 30d | all",
    program: "care program id or all",
    owner: "assigned user id or all",
    status: "call disposition or all",
    risk: "patient risk level or all",
    timeZone: "IANA time zone, defaults to UTC"
  },
  response: {
    metadata: "request metadata, filters, schema version, and redaction policy",
    metrics: "aggregate totals and rates",
    trends: "daily attempted/completed/failed/escalated counts",
    breakdowns: "care program, outcome, and risk-level groupings",
    escalationSummary: "open, urgent, and owner-level escalation counts",
    rows: "exportable call outcome rows"
  }
};

export function summarizeEvents(events) {
  return events.reduce((summary, event) => {
    summary[event.type] = (summary[event.type] || 0) + 1;
    return summary;
  }, {});
}
