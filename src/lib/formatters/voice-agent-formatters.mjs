export function formatPatientName(patient) {
  return [patient.firstName, patient.lastName].filter(Boolean).join(" ");
}

export function formatPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (normalized.length !== 10) {
    return value;
  }

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

export function formatCallStatus(status) {
  const labels = {
    scheduled: "Scheduled",
    initiated: "Initiated",
    ringing: "Ringing",
    answered: "Answered",
    completed: "Completed",
    no_answer: "No answer",
    busy: "Busy",
    voicemail: "Voicemail",
    failed: "Failed",
    canceled: "Canceled"
  };

  return labels[status] || "Unknown";
}

export function formatTimestamp(value, timeZone = "America/Los_Angeles") {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone
  }).format(new Date(value));
}
