export function listCalls(callSessions, filters = {}) {
  return callSessions
    .filter((call) => (filters.patientId ? call.patientId === filters.patientId : true))
    .filter((call) => (filters.status ? call.status === filters.status : true))
    .filter((call) => (filters.disposition ? call.disposition === filters.disposition : true))
    .sort((a, b) => String(b.startedAt || "").localeCompare(String(a.startedAt || "")));
}

export function getCallDetail({ callSessions, transcriptTurns, escalations, patients, carePrograms }, callSessionId) {
  const call = callSessions.find((item) => item.id === callSessionId);
  if (!call) return undefined;
  const patient = patients.find((item) => item.id === call.patientId);
  const careProgram = patient ? carePrograms.find((item) => item.id === patient.careProgramId) : undefined;
  const transcript = transcriptTurns
    .filter((turn) => turn.callSessionId === callSessionId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const relatedEscalations = escalations.filter((item) => item.callSessionId === callSessionId);
  return {
    call,
    patient,
    careProgram,
    transcript,
    escalations: relatedEscalations,
    timeline: buildCallTimeline(call, transcript, relatedEscalations)
  };
}

export function buildCallTimeline(call, transcript = [], escalations = []) {
  const events = [];
  if (call.startedAt) events.push({ type: "call_started", at: call.startedAt, label: "Call started" });
  for (const turn of transcript) {
    events.push({ type: "transcript_turn", at: turn.startedAt, label: `${turn.speaker}: ${turn.text}`, turnId: turn.id });
  }
  for (const escalation of escalations) {
    events.push({ type: "escalation_created", at: escalation.createdAt, label: escalation.reason, escalationId: escalation.id });
  }
  if (call.endedAt) events.push({ type: "call_ended", at: call.endedAt, label: call.disposition || call.status });
  return events.sort((a, b) => a.at.localeCompare(b.at));
}
