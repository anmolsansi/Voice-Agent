export function listSchedulesForPatient(schedules, patientId) {
  return schedules.filter((schedule) => schedule.patientId === patientId);
}

export function validateScheduleInput(input) {
  const errors = {};
  if (!input.patientId) errors.patientId = "Patient is required.";
  if (!input.cadence) errors.cadence = "Cadence is required.";
  if (!input.timeZone) errors.timeZone = "Time zone is required.";
  if (!/^\d{2}:\d{2}$/.test(input.windowStart || "")) errors.windowStart = "Window start must be HH:MM.";
  if (!/^\d{2}:\d{2}$/.test(input.windowEnd || "")) errors.windowEnd = "Window end must be HH:MM.";
  if ((input.maxAttempts ?? 0) < 1) errors.maxAttempts = "Max attempts must be at least 1.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function createSchedule(schedules, input, now = new Date()) {
  const validation = validateScheduleInput(input);
  if (!validation.valid) return { ok: false, errors: validation.errors };
  if (schedules.some((schedule) => schedule.patientId === input.patientId && schedule.status === "active")) {
    return { ok: false, error: "duplicate_active_schedule" };
  }
  const schedule = {
    id: input.id || `schedule-${input.patientId}-${input.cadence}`,
    status: "active",
    maxAttempts: 3,
    ...input,
    nextRunAt: input.nextRunAt || calculateNextRunAt(input, now)
  };
  return { ok: true, schedules: [...schedules, schedule], schedule };
}

export function updateSchedule(schedules, scheduleId, patch, now = new Date()) {
  const existing = schedules.find((schedule) => schedule.id === scheduleId);
  if (!existing) return { ok: false, error: "schedule_not_found" };
  const updated = { ...existing, ...patch, id: scheduleId };
  const validation = validateScheduleInput(updated);
  if (!validation.valid) return { ok: false, errors: validation.errors };
  if (!patch.nextRunAt && ["cadence", "windowStart", "windowEnd", "timeZone"].some((key) => key in patch)) {
    updated.nextRunAt = calculateNextRunAt(updated, now);
  }
  return {
    ok: true,
    schedules: schedules.map((schedule) => (schedule.id === scheduleId ? updated : schedule)),
    schedule: updated
  };
}

export function pauseSchedule(schedules, scheduleId, pausedAt = new Date().toISOString()) {
  return updateSchedule(schedules, scheduleId, { status: "paused", pausedAt });
}

export function resumeSchedule(schedules, scheduleId, now = new Date()) {
  const existing = schedules.find((schedule) => schedule.id === scheduleId);
  if (!existing) return { ok: false, error: "schedule_not_found" };
  return updateSchedule(schedules, scheduleId, { status: "active", pausedAt: undefined, nextRunAt: calculateNextRunAt(existing, now) }, now);
}

export function evaluateCallEligibility({ patient, schedule, callSessions = [], now = new Date() }) {
  if (!patient) return { eligible: false, reason: "missing_patient" };
  if (patient.archivedAt) return { eligible: false, reason: "patient_archived" };
  if (patient.consentStatus !== "granted") return { eligible: false, reason: "missing_consent" };
  if (!schedule) return { eligible: false, reason: "missing_schedule" };
  if (schedule.status !== "active") return { eligible: false, reason: "schedule_not_active" };
  if (schedule.nextRunAt && new Date(schedule.nextRunAt) > now) return { eligible: false, reason: "not_due" };
  if (!isInsideWindow(now, schedule)) return { eligible: false, reason: "outside_call_window" };
  const active = callSessions.some(
    (call) => call.patientId === patient.id && ["initiated", "ringing", "answered"].includes(call.status)
  );
  if (active) return { eligible: false, reason: "duplicate_active_call" };
  const attempts = callSessions.filter(
    (call) => call.scheduleId === schedule.id && sameLocalDate(call.startedAt, now, schedule.timeZone)
  ).length;
  if (attempts >= schedule.maxAttempts) return { eligible: false, reason: "max_attempts_reached" };
  return { eligible: true, reason: "eligible" };
}

export function calculateNextRunAt(schedule, from = new Date()) {
  const days = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 }[schedule.cadence] || 7;
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  const [hour, minute] = schedule.windowStart.split(":").map(Number);
  next.setUTCHours(hour, minute, 0, 0);
  return next.toISOString();
}

function isInsideWindow(now, schedule) {
  const local = localTime(now, schedule.timeZone);
  if (schedule.windowStart <= schedule.windowEnd) {
    return local >= schedule.windowStart && local <= schedule.windowEnd;
  }
  return local >= schedule.windowStart || local <= schedule.windowEnd;
}

function localTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "hour").value}:${parts.find((part) => part.type === "minute").value}`;
}

function sameLocalDate(value, date, timeZone) {
  if (!value) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "short", timeZone });
  return formatter.format(new Date(value)) === formatter.format(date);
}
