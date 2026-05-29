import { voiceAgentFixtures } from "../../lib/mock-data/voice-agent-fixtures.mjs";

const DEFAULT_SCHEMA_VERSION = "voice-report-v1";
const DEFAULT_NOW = "2026-05-15T00:00:00.000Z";
const ACTIVE_ESCALATION_STATUSES = new Set(["open", "assigned", "in_progress"]);
const REACHED_DISPOSITIONS = new Set(["completed", "escalated", "opted_out"]);
const FALLBACK_DISPOSITIONS = new Set(["no_answer", "voicemail", "opted_out"]);
const PHI_TEXT_REDACTION = "[redacted summary]";

function toDate(value) {
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

function isoDate(value) {
  return value.toISOString().slice(0, 10);
}

function clampRange(filters = {}) {
  const now = toDate(filters.now) || new Date(DEFAULT_NOW);
  const range = filters.range || "30d";

  if (range === "all") {
    return { range, startDate: undefined, endDate: now };
  }

  const days = range === "7d" ? 7 : 30;
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - (days - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  return { range, startDate, endDate: now };
}

function isWithinRange(value, startDate, endDate) {
  const date = toDate(value);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function percentage(numerator, denominator) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function average(values) {
  const numericValues = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (numericValues.length === 0) return 0;
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function secondsBetween(startedAt, endedAt) {
  const started = toDate(startedAt);
  const ended = toDate(endedAt);
  if (!started || !ended) return 0;
  return Math.max(0, Math.round((ended.getTime() - started.getTime()) / 1000));
}

function getPatientName(patient) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function redactPhoneNumber(phoneNumber = "") {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 4) return "redacted";
  return `redacted-${digits.slice(-4)}`;
}

function getProgramName(careProgramsById, patient) {
  return careProgramsById.get(patient.careProgramId)?.name || "Unknown program";
}

function getOwnerName(usersById, patient) {
  return usersById.get(patient.assignedUserId)?.name || "Unassigned";
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function sortByDateDescending(left, right) {
  return String(right.startedAt || right.createdAt || "").localeCompare(String(left.startedAt || left.createdAt || ""));
}

export const reportRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All data", value: "all" }
];

export function listReportFilterOptions(dataset = voiceAgentFixtures) {
  const usersById = new Map(dataset.users.map((user) => [user.id, user]));

  return {
    programs: dataset.carePrograms.map((program) => ({
      label: program.name,
      value: program.id
    })),
    owners: dataset.users.map((user) => ({
      label: user.name,
      value: user.id
    })),
    statuses: [
      { label: "All statuses", value: "all" },
      ...Array.from(new Set(dataset.callSessions.map((call) => call.disposition))).map((disposition) => ({
        label: formatReportLabel(disposition),
        value: disposition
      }))
    ],
    usersById
  };
}

export function normalizeReportFilters(filters = {}) {
  const range = ["7d", "30d", "all"].includes(filters.range) ? filters.range : "30d";

  return {
    range,
    program: filters.program || "all",
    owner: filters.owner || "all",
    status: filters.status || "all",
    requestedBy: filters.requestedBy || "system"
  };
}

export function buildVoiceReport(filters = {}, dataset = voiceAgentFixtures) {
  const normalizedFilters = normalizeReportFilters(filters);
  const { startDate, endDate, range } = clampRange({ ...normalizedFilters, now: filters.now });
  const usersById = new Map(dataset.users.map((user) => [user.id, user]));
  const patientsById = new Map(dataset.patients.map((patient) => [patient.id, patient]));
  const careProgramsById = new Map(dataset.carePrograms.map((program) => [program.id, program]));

  const patientMatches = (patient) => {
    if (!patient) return false;
    if (normalizedFilters.program !== "all" && patient.careProgramId !== normalizedFilters.program) return false;
    if (normalizedFilters.owner !== "all" && patient.assignedUserId !== normalizedFilters.owner) return false;
    return true;
  };

  const calls = dataset.callSessions
    .filter((call) => isWithinRange(call.startedAt, startDate, endDate))
    .filter((call) => normalizedFilters.status === "all" || call.disposition === normalizedFilters.status)
    .filter((call) => patientMatches(patientsById.get(call.patientId)))
    .sort(sortByDateDescending);

  const filteredPatientIds = new Set(calls.map((call) => call.patientId));
  const schedules = dataset.checkInSchedules.filter((schedule) => patientMatches(patientsById.get(schedule.patientId)));
  const escalations = dataset.escalations
    .filter((escalation) => isWithinRange(escalation.createdAt, startDate, endDate))
    .filter((escalation) => patientMatches(patientsById.get(escalation.patientId)));

  const transcriptTurnsByCallId = new Map();
  for (const turn of dataset.transcriptTurns) {
    if (!transcriptTurnsByCallId.has(turn.callSessionId)) {
      transcriptTurnsByCallId.set(turn.callSessionId, []);
    }
    transcriptTurnsByCallId.get(turn.callSessionId).push(turn);
  }

  const completedCheckIns = calls.filter((call) => call.disposition === "completed").length;
  const failedCalls = calls.filter((call) => ["failed", "no_answer", "voicemail"].includes(call.status)).length;
  const retryCalls = calls.filter((call) => Number(call.attemptNumber || 1) > 1).length;
  const activeEscalations = escalations.filter((escalation) => ACTIVE_ESCALATION_STATUSES.has(escalation.status));
  const urgentAlerts = escalations.filter((escalation) => escalation.priority === "urgent").length;
  const fallbackCount = calls.filter((call) => FALLBACK_DISPOSITIONS.has(call.disposition)).length;
  const durationSeconds = calls.map((call) => secondsBetween(call.startedAt, call.endedAt));
  const confidenceValues = calls.flatMap((call) => (transcriptTurnsByCallId.get(call.id) || []).map((turn) => turn.confidence));

  const trendMap = new Map();
  for (const call of calls) {
    const day = isoDate(new Date(call.startedAt));
    const existing = trendMap.get(day) || {
      date: day,
      attempted: 0,
      completed: 0,
      failed: 0,
      escalated: 0
    };
    existing.attempted += 1;
    if (call.disposition === "completed") existing.completed += 1;
    if (["failed", "no_answer", "voicemail"].includes(call.status)) existing.failed += 1;
    if (call.disposition === "escalated") existing.escalated += 1;
    trendMap.set(day, existing);
  }

  const rows = calls.map((call) => {
    const patient = patientsById.get(call.patientId);
    const callTurns = transcriptTurnsByCallId.get(call.id) || [];
    const callEscalations = escalations.filter((escalation) => escalation.callSessionId === call.id);

    return {
      callId: call.id,
      patientId: call.patientId,
      patientName: patient ? getPatientName(patient) : "Unknown patient",
      phone: patient ? redactPhoneNumber(patient.phoneNumber) : "redacted",
      program: patient ? getProgramName(careProgramsById, patient) : "Unknown program",
      owner: patient ? getOwnerName(usersById, patient) : "Unassigned",
      disposition: call.disposition,
      status: call.status,
      startedAt: call.startedAt,
      durationSeconds: secondsBetween(call.startedAt, call.endedAt),
      attemptNumber: call.attemptNumber || 1,
      escalationCount: callEscalations.length,
      urgentEscalationCount: callEscalations.filter((escalation) => escalation.priority === "urgent").length,
      averageConfidence: Number(average(callTurns.map((turn) => turn.confidence)).toFixed(2)),
      summary: PHI_TEXT_REDACTION
    };
  });

  return {
    metadata: {
      requestedBy: normalizedFilters.requestedBy,
      generatedAt: new Date(filters.generatedAt || DEFAULT_NOW).toISOString(),
      filters: {
        ...normalizedFilters,
        range,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null
      },
      rowCount: rows.length,
      schemaVersion: DEFAULT_SCHEMA_VERSION,
      redactions: ["phone", "summary"]
    },
    metrics: {
      scheduledCalls: schedules.filter((schedule) => schedule.status === "active").length,
      attemptedCalls: calls.length,
      reachedPatients: uniqueCount(calls.filter((call) => REACHED_DISPOSITIONS.has(call.disposition)).map((call) => call.patientId)),
      completedCheckIns,
      failedCalls,
      retryRate: percentage(retryCalls, calls.length),
      escalationRate: percentage(escalations.length, calls.length),
      urgentAlertCount: urgentAlerts,
      averageDurationSeconds: Math.round(average(durationSeconds)),
      fallbackCount,
      transcriptConfidence: Number(average(confidenceValues).toFixed(2)),
      activeEscalations: activeEscalations.length,
      completionRate: percentage(completedCheckIns, calls.length)
    },
    trends: Array.from(trendMap.values()).sort((left, right) => left.date.localeCompare(right.date)),
    rows,
    empty: rows.length === 0
  };
}

export function exportVoiceReportCsv(report) {
  const metadataRows = [
    ["schemaVersion", report.metadata.schemaVersion],
    ["generatedAt", report.metadata.generatedAt],
    ["requestedBy", report.metadata.requestedBy],
    ["rowCount", report.metadata.rowCount],
    ["filters", JSON.stringify(report.metadata.filters)],
    []
  ];
  const headers = [
    "callId",
    "patientId",
    "patientName",
    "phone",
    "program",
    "owner",
    "disposition",
    "status",
    "startedAt",
    "durationSeconds",
    "attemptNumber",
    "escalationCount",
    "urgentEscalationCount",
    "averageConfidence",
    "summary"
  ];
  const dataRows = report.rows.map((row) => headers.map((header) => row[header]));

  return [
    ...metadataRows.map((row) => row.map(csvCell).join(",")),
    headers.map(csvCell).join(","),
    ...dataRows.map((row) => row.map(csvCell).join(","))
  ].join("\n");
}

export function formatReportLabel(value = "") {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
