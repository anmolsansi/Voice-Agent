export function validateOutboundCallEligibility({ patient, schedule, activeCallSessions = [], now = new Date() }) {
  if (!patient) {
    return { eligible: false, reason: "missing_patient" };
  }
  if (patient.archivedAt) {
    return { eligible: false, reason: "patient_archived" };
  }
  if (patient.consentStatus !== "granted") {
    return { eligible: false, reason: "missing_consent" };
  }
  if (!/^\+1\d{10}$/.test(patient.phoneNumber)) {
    return { eligible: false, reason: "invalid_phone_number" };
  }
  if (schedule?.status === "paused") {
    return { eligible: false, reason: "schedule_paused" };
  }
  if (activeCallSessions.some((call) => call.patientId === patient.id && ["initiated", "ringing", "answered"].includes(call.status))) {
    return { eligible: false, reason: "duplicate_active_call" };
  }
  if (schedule && !isInsideWindow(now, schedule)) {
    return { eligible: false, reason: "outside_call_window" };
  }
  return { eligible: true, reason: "eligible" };
}

export function initiateSandboxOutboundCall({ patient, schedule, requestedBy = "system", now = new Date(), activeCallSessions = [] }) {
  const eligibility = validateOutboundCallEligibility({ patient, schedule, activeCallSessions, now });
  if (!eligibility.eligible) {
    return { ok: false, error: eligibility.reason };
  }

  const stamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return {
    ok: true,
    callSession: {
      id: `call-${patient.id}-${stamp}`,
      patientId: patient.id,
      scheduleId: schedule?.id,
      providerCallId: `sandbox-${patient.id}-${stamp}`,
      status: "initiated",
      startedAt: now.toISOString(),
      attemptNumber: 1,
      requestedBy,
      transcriptTurnIds: [],
      escalationIds: []
    }
  };
}

function isInsideWindow(now, schedule) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: schedule.timeZone
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour").value;
  const minute = parts.find((part) => part.type === "minute").value;
  const localTime = `${hour}:${minute}`;
  return localTime >= schedule.windowStart && localTime <= schedule.windowEnd;
}
