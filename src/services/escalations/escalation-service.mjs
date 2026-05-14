import { evaluateSafety } from "../../voice/guardrails/safety-guardrails.mjs";

const allowedTransitions = {
  open: ["assigned", "in_progress", "resolved", "dismissed"],
  assigned: ["in_progress", "resolved", "dismissed", "reopened"],
  in_progress: ["resolved", "dismissed", "reopened"],
  resolved: ["reopened"],
  dismissed: ["reopened"],
  reopened: ["assigned", "in_progress", "resolved", "dismissed"]
};

export function createEscalationFromTurn(escalations, { patientId, callSessionId, transcriptTurn, assignedUserId, at = new Date().toISOString() }) {
  const safety = evaluateSafety(transcriptTurn?.text || "");
  if (safety.safe && safety.action !== "safe_fallback") {
    return { ok: false, error: "no_escalation_needed" };
  }
  const duplicate = escalations.find(
    (item) =>
      item.callSessionId === callSessionId &&
      item.transcriptTurnId === transcriptTurn?.id &&
      !["resolved", "dismissed"].includes(item.status)
  );
  if (duplicate) {
    return { ok: true, escalations, escalation: duplicate, duplicate: true };
  }
  const escalation = {
    id: `escalation-${callSessionId}-${transcriptTurn?.id || at.replace(/[-:.TZ]/g, "")}`,
    patientId,
    callSessionId,
    transcriptTurnId: transcriptTurn?.id,
    priority: safety.priority || "medium",
    status: assignedUserId ? "assigned" : "open",
    reason: safety.reason || "callback_requested",
    assignedUserId,
    createdAt: at
  };
  return { ok: true, escalations: [...escalations, escalation], escalation, duplicate: false };
}

export function assignEscalation(escalations, escalationId, assignedUserId) {
  return updateEscalationStatus(escalations, escalationId, "assigned", { assignedUserId });
}

export function updateEscalationStatus(escalations, escalationId, status, patch = {}) {
  const existing = escalations.find((item) => item.id === escalationId);
  if (!existing) return { ok: false, error: "escalation_not_found" };
  if (!allowedTransitions[existing.status]?.includes(status) && existing.status !== status) {
    return { ok: false, error: "invalid_status_transition" };
  }
  if (status === "resolved" && !patch.resolutionNote) {
    return { ok: false, error: "resolution_note_required" };
  }
  const updated = {
    ...existing,
    ...patch,
    status,
    resolvedAt: status === "resolved" ? patch.resolvedAt || new Date().toISOString() : existing.resolvedAt
  };
  return {
    ok: true,
    escalations: escalations.map((item) => (item.id === escalationId ? updated : item)),
    escalation: updated
  };
}

export function listEscalations(escalations, filters = {}) {
  const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };
  return escalations
    .filter((item) => (filters.status ? item.status === filters.status : true))
    .filter((item) => (filters.assignedUserId ? item.assignedUserId === filters.assignedUserId : true))
    .filter((item) => (filters.patientId ? item.patientId === filters.patientId : true))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.createdAt.localeCompare(b.createdAt));
}
