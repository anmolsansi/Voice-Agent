import { voiceAgentFixtures } from "../src/lib/mock-data/voice-agent-fixtures.mjs";
import { conversationEvaluationFixtures } from "../tests/fixtures/conversations/evaluation-fixtures.mjs";
import {
  formatCallStatus,
  formatPatientName,
  formatPhoneNumber,
  formatTimestamp
} from "../src/lib/formatters/voice-agent-formatters.mjs";
import { classifyIntent } from "../src/voice/intents/intent-map.mjs";
import {
  advanceConversation,
  createInitialConversationState
} from "../src/voice/state-machine/conversation-state-machine.mjs";
import { renderPrompt } from "../src/voice/prompts/templates.mjs";
import { initiateSandboxOutboundCall } from "../src/voice/provider/sandbox-provider.mjs";
import {
  applyLifecycleEvent,
  parseVoiceWebhook,
  signWebhookPayload
} from "../src/voice/provider/webhooks.mjs";
import { createRealtimeSession, handleRealtimeEvent } from "../src/voice/realtime/turn-handler.mjs";
import {
  archivePatient,
  createPatient,
  getPatient,
  listPatients,
  updatePatient
} from "../src/services/patients/patient-service.mjs";
import {
  createSchedule,
  evaluateCallEligibility,
  pauseSchedule,
  resumeSchedule
} from "../src/services/schedules/schedule-service.mjs";
import { createGuardrailHit, evaluateSafety } from "../src/voice/guardrails/safety-guardrails.mjs";
import {
  assignEscalation,
  createEscalationFromTurn,
  listEscalations,
  updateEscalationStatus
} from "../src/services/escalations/escalation-service.mjs";
import { getCallDetail, listCalls } from "../src/services/calls/call-service.mjs";
import { runScheduledCallJob } from "../src/jobs/scheduled-calls.mjs";
import { createAuditEvent } from "../src/lib/audit/audit-log.mjs";
import { createLogEvent } from "../src/lib/logger.mjs";
import { defaultHealthChecks, runHealthChecks } from "../src/services/health/health-checks.mjs";
import { createPromptReviewRecord, validateStructuredModelOutput } from "../src/voice/prompts/governance.mjs";
import {
  buildCallReview,
  buildDashboardSummary,
  buildEscalationInbox,
  buildPatientDetail
} from "../src/dashboard/selectors.mjs";
import {
  buildVoiceReport,
  exportVoiceReportCsv,
  listReportFilterOptions
} from "../src/services/reports/reporting-service.mjs";
import {
  analyticsEventTypes,
  buildAnalyticsEventsFromFixtures,
  dedupeAnalyticsEvents
} from "../src/analytics/events.mjs";
import { aggregationContract, metricDefinitions, summarizeEvents } from "../src/analytics/metrics.mjs";

const {
  users,
  carePrograms,
  patients,
  checkInSchedules,
  callSessions,
  transcriptTurns,
  escalations
} = voiceAgentFixtures;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function idSet(records) {
  return new Set(records.map((record) => record.id));
}

const userIds = idSet(users);
const careProgramIds = idSet(carePrograms);
const patientIds = idSet(patients);
const scheduleIds = idSet(checkInSchedules);
const callSessionIds = idSet(callSessions);
const transcriptTurnIds = idSet(transcriptTurns);
const escalationIds = idSet(escalations);

assert(users.length >= 2, "expected at least two users");
assert(carePrograms.length >= 2, "expected at least two care programs");
assert(patients.length >= 4, "expected at least four patient fixtures");
assert(callSessions.length >= 5, "expected completed, no-answer, voicemail, opt-out, and escalated call fixtures");

for (const patient of patients) {
  assert(careProgramIds.has(patient.careProgramId), `unknown care program for ${patient.id}`);
  assert(userIds.has(patient.assignedUserId), `unknown assigned user for ${patient.id}`);
  assert(patient.phoneNumber.startsWith("+1"), `expected normalized E.164 phone for ${patient.id}`);
}

for (const schedule of checkInSchedules) {
  assert(patientIds.has(schedule.patientId), `unknown patient for ${schedule.id}`);
  assert(schedule.windowStart < schedule.windowEnd, `invalid time window for ${schedule.id}`);
}

for (const callSession of callSessions) {
  assert(patientIds.has(callSession.patientId), `unknown patient for ${callSession.id}`);
  if (callSession.scheduleId) {
    assert(scheduleIds.has(callSession.scheduleId), `unknown schedule for ${callSession.id}`);
  }
  for (const transcriptTurnId of callSession.transcriptTurnIds) {
    assert(transcriptTurnIds.has(transcriptTurnId), `unknown transcript turn ${transcriptTurnId}`);
  }
  for (const escalationId of callSession.escalationIds) {
    assert(escalationIds.has(escalationId), `unknown escalation ${escalationId}`);
  }
}

for (const turn of transcriptTurns) {
  assert(callSessionIds.has(turn.callSessionId), `unknown call session for ${turn.id}`);
  assert(new Date(turn.startedAt) <= new Date(turn.endedAt), `invalid turn timing for ${turn.id}`);
}

for (const escalation of escalations) {
  assert(patientIds.has(escalation.patientId), `unknown patient for ${escalation.id}`);
  assert(callSessionIds.has(escalation.callSessionId), `unknown call session for ${escalation.id}`);
  if (escalation.transcriptTurnId) {
    assert(transcriptTurnIds.has(escalation.transcriptTurnId), `unknown transcript turn for ${escalation.id}`);
  }
  if (escalation.assignedUserId) {
    assert(userIds.has(escalation.assignedUserId), `unknown assignee for ${escalation.id}`);
  }
}

assert(formatPatientName(patients[0]) === "Maria Garcia", "formatPatientName failed");
assert(formatPhoneNumber("+14155550101") === "(415) 555-0101", "formatPhoneNumber failed");
assert(formatCallStatus("no_answer") === "No answer", "formatCallStatus failed");
assert(formatTimestamp("2026-05-08T20:02:00.000Z").length > 0, "formatTimestamp failed");

assert(classifyIntent("I am having chest pain").intent === "urgent_symptom", "urgent intent classification failed");
assert(classifyIntent("Please stop calling me").intent === "opt_out", "opt-out intent classification failed");

let conversation = createInitialConversationState("call-validation");
let step = advanceConversation(conversation, { text: "" });
assert(step.state.currentState === "identity_verification", "greeting transition failed");
step = advanceConversation(step.state, { text: "Yes, this is Maria" });
assert(step.state.currentState === "consent", "identity transition failed");
step = advanceConversation(step.state, { text: "I agree" });
assert(step.state.currentState === "question_sequence", "consent transition failed");
step = advanceConversation(step.state, { text: "No new symptoms and I do not need a callback" });
assert(step.state.disposition === "completed", "completion disposition failed");

const renderedPrompt = renderPrompt("callContext", {
  patientName: "Maria Garcia",
  programName: "Heart Health Check-In",
  currentState: "consent",
  consentStatus: "granted"
});
assert(renderedPrompt.includes("Maria Garcia"), "prompt rendering failed");
assert(conversationEvaluationFixtures.length >= 6, "expected prompt evaluation fixtures");

const maria = patients.find((patient) => patient.id === "patient-maria-garcia");
const mariaSchedule = checkInSchedules.find((schedule) => schedule.id === "schedule-maria-weekly");
const outbound = initiateSandboxOutboundCall({
  patient: maria,
  schedule: mariaSchedule,
  now: new Date("2026-05-15T20:30:00.000Z")
});
assert(outbound.ok === true, "sandbox outbound call failed");
assert(outbound.callSession.status === "initiated", "sandbox outbound call status failed");

const webhookPayload = JSON.stringify({
  id: "event-001",
  type: "call_voicemail",
  callId: outbound.callSession.providerCallId,
  receivedAt: "2026-05-15T20:31:00.000Z",
  machineDetected: true
});
const webhookSecret = "local-secret";
const webhook = parseVoiceWebhook(webhookPayload, {
  signature: signWebhookPayload(webhookPayload, webhookSecret),
  secret: webhookSecret
});
assert(webhook.ok === true, "webhook parsing failed");
assert(webhook.lifecycleEvent.voicemailDetected === true, "voicemail detection failed");
const appliedEvent = applyLifecycleEvent(outbound.callSession, webhook.lifecycleEvent);
assert(appliedEvent.callSession.status === "voicemail", "webhook status application failed");

let realtimeSession = createRealtimeSession({
  callSessionId: "call-realtime-validation",
  conversationState: createInitialConversationState("call-realtime-validation"),
  context: { firstName: "Maria", lastName: "Garcia", programName: "Heart Health" }
});
let realtime = handleRealtimeEvent(realtimeSession, { type: "speech_start" });
assert(realtime.action === "listening", "realtime speech_start failed");
realtime = handleRealtimeEvent(realtime.session, {
  type: "final_transcript",
  text: "Yes, this is Maria",
  confidence: 0.96,
  startedAt: "2026-05-15T20:30:00.000Z",
  endedAt: "2026-05-15T20:30:03.000Z"
});
assert(realtime.action === "speak", "realtime final transcript failed");
assert(realtime.session.turns.length === 2, "realtime turn persistence failed");

const activePatients = listPatients(patients);
assert(activePatients.every((patient) => !patient.archivedAt), "listPatients should exclude archived records by default");
assert(getPatient(patients, "patient-maria-garcia").firstName === "Maria", "getPatient failed");
const patientCreate = createPatient(patients, {
  firstName: "Nina",
  lastName: "Rivera",
  phoneNumber: "+14155550111",
  timeZone: "America/Los_Angeles",
  preferredLanguage: "en-US",
  consentStatus: "granted",
  riskLevel: "low",
  careProgramId: "program-heart-health",
  assignedUserId: "user-care-001"
});
assert(patientCreate.ok, "createPatient failed");
const patientUpdate = updatePatient(patientCreate.patients, patientCreate.patient.id, { riskLevel: "medium" });
assert(patientUpdate.ok && patientUpdate.patient.riskLevel === "medium", "updatePatient failed");
const patientArchive = archivePatient(patientUpdate.patients, patientCreate.patient.id, "2026-05-14T20:00:00.000Z");
assert(patientArchive.ok && patientArchive.patient.consentStatus === "revoked", "archivePatient failed");

const scheduleCreate = createSchedule(checkInSchedules, {
  patientId: "patient-maria-garcia",
  cadence: "daily",
  timeZone: "America/Los_Angeles",
  windowStart: "13:00",
  windowEnd: "16:00",
  maxAttempts: 2
});
assert(scheduleCreate.ok === false && scheduleCreate.error === "duplicate_active_schedule", "duplicate schedule validation failed");
const paused = pauseSchedule(checkInSchedules, "schedule-evelyn-weekly", "2026-05-14T20:00:00.000Z");
assert(paused.ok && paused.schedule.status === "paused", "pauseSchedule failed");
const resumed = resumeSchedule(paused.schedules, "schedule-evelyn-weekly", new Date("2026-05-14T20:00:00.000Z"));
assert(resumed.ok && resumed.schedule.status === "active", "resumeSchedule failed");
const dueSchedule = {
  ...mariaSchedule,
  nextRunAt: "2026-05-15T19:00:00.000Z"
};
const eligibility = evaluateCallEligibility({
  patient: maria,
  schedule: dueSchedule,
  callSessions,
  now: new Date("2026-05-15T20:30:00.000Z")
});
assert(eligibility.eligible, "schedule eligibility failed");

const urgentSafety = evaluateSafety("I have chest pain and shortness of breath");
assert(urgentSafety.action === "escalate", "urgent safety detection failed");
const medicalAdviceSafety = evaluateSafety("Should I change my medication dose?");
assert(medicalAdviceSafety.reason === "unsupported_medical_advice", "medical advice guardrail failed");
const guardrailHit = createGuardrailHit({
  callSessionId: "call-evelyn-escalated",
  transcriptTurnId: "turn-evelyn-002",
  text: "I have chest pain"
});
assert(guardrailHit.reason === "urgent_symptom", "guardrail hit creation failed");

const evelynTurn = transcriptTurns.find((turn) => turn.id === "turn-evelyn-002");
const escalationCreate = createEscalationFromTurn([], {
  patientId: "patient-evelyn-chen",
  callSessionId: "call-evelyn-escalated",
  transcriptTurn: evelynTurn,
  assignedUserId: "user-clinician-001",
  at: "2026-05-14T20:00:00.000Z"
});
assert(escalationCreate.ok && escalationCreate.escalation.status === "assigned", "createEscalationFromTurn failed");
const assigned = assignEscalation(escalationCreate.escalations, escalationCreate.escalation.id, "user-care-001");
assert(assigned.ok && assigned.escalation.assignedUserId === "user-care-001", "assignEscalation failed");
const resolved = updateEscalationStatus(assigned.escalations, assigned.escalation.id, "resolved", {
  resolutionNote: "Care team contacted patient.",
  resolvedAt: "2026-05-14T20:30:00.000Z"
});
assert(resolved.ok && resolved.escalation.status === "resolved", "resolve escalation failed");
assert(listEscalations(escalations, { status: "open" }).length >= 1, "listEscalations failed");

const callDetail = getCallDetail(voiceAgentFixtures, "call-evelyn-escalated");
assert(callDetail.transcript.length === 3, "getCallDetail transcript failed");
assert(callDetail.timeline.some((event) => event.type === "escalation_created"), "call timeline escalation failed");
assert(listCalls(callSessions, { disposition: "voicemail" }).length === 1, "listCalls filter failed");

const job = runScheduledCallJob({
  patients,
  schedules: [{ ...mariaSchedule, nextRunAt: "2026-05-15T19:00:00.000Z" }],
  callSessions,
  now: new Date("2026-05-15T20:30:00.000Z")
});
assert(job.createdCalls.length === 1, "scheduled call job failed");
assert(job.jobRun.createdCount === 1, "scheduled call job count failed");

const audit = createAuditEvent({
  action: "patient.update",
  resourceType: "patient",
  resourceId: "patient-maria-garcia",
  metadata: { webhookSecret: "do-not-log", changed: "riskLevel" }
});
assert(audit.metadata.webhookSecret === undefined, "audit metadata sanitization failed");
const log = createLogEvent("info", "provider call created", { apiKey: "secret", providerCallId: "provider-call-001" });
assert(log.metadata.apiKey === "[redacted]", "logger metadata redaction failed");
const health = runHealthChecks(defaultHealthChecks({ patients, schedules: checkInSchedules }));
assert(health.status === "healthy", "health checks failed");

const structuredOutput = validateStructuredModelOutput({
  intent: "routine_status",
  nextState: "summary",
  responseText: "Thank you.",
  capturedSlots: {},
  disposition: "completed",
  guardrailHit: false
});
assert(structuredOutput.valid, "structured model output validation failed");
const review = createPromptReviewRecord({
  fixtureId: "happy-path-completed",
  expected: "completed",
  actual: "completed"
});
assert(review.passed, "prompt review record failed");

const dashboard = buildDashboardSummary({
  patients,
  schedules: checkInSchedules,
  callSessions,
  escalations,
  now: new Date("2026-05-10T20:00:00.000Z")
});
assert(dashboard.openEscalations >= 1, "dashboard summary failed");
const patientDetail = buildPatientDetail(
  { patients, carePrograms, schedules: checkInSchedules, callSessions, escalations },
  "patient-evelyn-chen"
);
assert(patientDetail.openEscalations.length === 1, "patient detail failed");
assert(buildCallReview(voiceAgentFixtures, "call-maria-completed").transcript.length === 3, "call review failed");
const inbox = buildEscalationInbox(voiceAgentFixtures, { status: "open" });
assert(inbox[0].patient.id === "patient-evelyn-chen", "escalation inbox failed");

const report = buildVoiceReport({ range: "30d", now: "2026-05-15T00:00:00.000Z", requestedBy: "validation" });
assert(report.metrics.attemptedCalls === 5, "report attempted call count failed");
assert(report.metrics.completedCheckIns === 1, "report completed check-in count failed");
assert(report.metrics.failedCalls === 2, "report failed call count failed");
assert(report.metrics.retryRate === "20%", "report retry rate failed");
assert(report.metrics.escalationRate === "20%", "report escalation rate failed");
assert(report.metrics.contactRate === "60%", "report contact rate failed");
assert(report.metrics.noAnswerRate === "20%", "report no-answer rate failed");
assert(report.metrics.guardrailRate === "20%", "report guardrail rate failed");
assert(report.metrics.transcriptConfidence > 0, "report confidence metric failed");
assert(report.metricDefinitions.completionRate.formula.includes("completed"), "report metric definitions failed");
assert(report.aggregationContract.request.timeZone.includes("IANA"), "report aggregation contract failed");
assert(report.eventSummary.call_dialed === 5, "report event summary failed");
assert(report.breakdowns.byProgram.length >= 2, "report program breakdown failed");
assert(report.breakdowns.byOutcome.some((item) => item.label === "voicemail"), "report outcome breakdown failed");
assert(report.escalationSummary.open === 1, "report escalation summary failed");
assert(report.rows.every((row) => row.phone.startsWith("redacted-")), "report phone redaction failed");
assert(report.rows.every((row) => row.summary === "[redacted summary]"), "report summary redaction failed");
assert(buildVoiceReport({ range: "7d", program: "program-diabetes", status: "completed" }).empty, "report empty state failed");
assert(buildVoiceReport({ range: "30d", risk: "high" }).rows.every((row) => row.riskLevel === "high"), "report risk filter failed");
assert(listReportFilterOptions().programs.length >= 2, "report filter options failed");
assert(listReportFilterOptions().risks.length >= 3, "report risk filter options failed");
const csv = exportVoiceReportCsv(report);
assert(csv.includes("schemaVersion,voice-report-v1"), "report csv metadata failed");
assert(csv.includes("callId,patientId,patientName"), "report csv headers failed");
assert(!csv.includes("+14155550101"), "report csv should not expose raw phone number");

const analyticsEvents = buildAnalyticsEventsFromFixtures(voiceAgentFixtures);
const analyticsSummary = summarizeEvents(analyticsEvents);
assert(analyticsEventTypes.includes("guardrail_hit"), "analytics event type contract failed");
assert(analyticsSummary.call_dialed === 5, "analytics dialed event count failed");
assert(analyticsSummary.call_scheduled >= 2, "analytics scheduled event count failed");
assert(analyticsSummary.guardrail_hit >= 1, "analytics guardrail event count failed");
assert(dedupeAnalyticsEvents([analyticsEvents[0], analyticsEvents[0]]).length === 1, "analytics event dedupe failed");
assert(metricDefinitions.completionRate.formula === "completed check-ins / attempted calls", "metric formula contract failed");
assert(metricDefinitions.guardrailRate.formula === "unique guardrail-hit calls / attempted calls", "guardrail formula contract failed");
assert(aggregationContract.response.breakdowns.includes("care program"), "aggregation response contract failed");

console.log("Voice Agent fixtures validated.");
