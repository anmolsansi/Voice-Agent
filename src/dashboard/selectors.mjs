import { getCallDetail, listCalls } from "../services/calls/call-service.mjs";
import { listEscalations } from "../services/escalations/escalation-service.mjs";
import { listPatients } from "../services/patients/patient-service.mjs";
import { listSchedulesForPatient } from "../services/schedules/schedule-service.mjs";

export function buildDashboardSummary({ patients, schedules, callSessions, escalations, now = new Date() }) {
  const today = now.toISOString().slice(0, 10);
  const callsToday = callSessions.filter((call) => String(call.startedAt || "").startsWith(today));
  return {
    patientCount: listPatients(patients).length,
    callsToday: callsToday.length,
    completedCheckIns: callsToday.filter((call) => call.disposition === "completed").length,
    noAnswerCalls: callsToday.filter((call) => call.disposition === "no_answer").length,
    openEscalations: escalations.filter((item) => !["resolved", "dismissed"].includes(item.status)).length,
    upcomingCalls: schedules.filter((schedule) => schedule.status === "active").length,
    failedCalls: callsToday.filter((call) => call.status === "failed").length
  };
}

export function buildPatientDetail({ patients, carePrograms, schedules, callSessions, escalations }, patientId) {
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) return undefined;
  return {
    patient,
    careProgram: carePrograms.find((item) => item.id === patient.careProgramId),
    schedules: listSchedulesForPatient(schedules, patientId),
    recentCalls: listCalls(callSessions, { patientId }).slice(0, 5),
    openEscalations: listEscalations(escalations, { patientId }).filter((item) => !["resolved", "dismissed"].includes(item.status))
  };
}

export function buildCallReview(dataset, callSessionId) {
  return getCallDetail(dataset, callSessionId);
}

export function buildEscalationInbox({ escalations, patients, callSessions, transcriptTurns }, filters = {}) {
  return listEscalations(escalations, filters).map((escalation) => ({
    escalation,
    patient: patients.find((patient) => patient.id === escalation.patientId),
    call: callSessions.find((call) => call.id === escalation.callSessionId),
    triggerTurn: transcriptTurns.find((turn) => turn.id === escalation.transcriptTurnId)
  }));
}
