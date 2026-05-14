import { createHmac, timingSafeEqual } from "node:crypto";

const eventStatusMap = {
  call_initiated: "initiated",
  call_ringing: "ringing",
  call_answered: "answered",
  call_completed: "completed",
  call_failed: "failed",
  call_busy: "busy",
  call_no_answer: "no_answer",
  call_canceled: "canceled",
  call_voicemail: "voicemail",
  recording_available: "completed"
};

export function signWebhookPayload(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    return false;
  }
  const expected = signWebhookPayload(payload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function parseVoiceWebhook(payload, { signature, secret } = {}) {
  const rawPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
  if (secret && !verifyWebhookSignature(rawPayload, signature, secret)) {
    return { ok: false, error: "invalid_signature" };
  }

  const event = typeof payload === "string" ? JSON.parse(payload) : payload;
  const status = eventStatusMap[event.type];
  if (!status) {
    return { ok: false, error: "unsupported_event_type" };
  }

  return {
    ok: true,
    lifecycleEvent: {
      providerEventId: event.id,
      providerCallId: event.callId,
      eventType: event.type,
      receivedAt: event.receivedAt,
      status,
      recordingUrl: event.recordingUrl,
      voicemailDetected: event.type === "call_voicemail" || event.machineDetected === true,
      failureReason: event.failureReason
    }
  };
}

export function applyLifecycleEvent(callSession, lifecycleEvent, existingEventIds = new Set()) {
  if (existingEventIds.has(lifecycleEvent.providerEventId)) {
    return { callSession, duplicate: true };
  }

  const next = {
    ...callSession,
    status: lifecycleEvent.status,
    providerCallId: callSession.providerCallId || lifecycleEvent.providerCallId
  };

  if (["completed", "failed", "busy", "no_answer", "voicemail", "canceled"].includes(lifecycleEvent.status)) {
    next.endedAt = lifecycleEvent.receivedAt;
    next.disposition = lifecycleEvent.status === "completed" ? callSession.disposition || "completed" : lifecycleEvent.status;
  }
  if (lifecycleEvent.failureReason) {
    next.failureReason = lifecycleEvent.failureReason;
  }

  return { callSession: next, duplicate: false };
}
