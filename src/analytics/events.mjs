export const analyticsEventTypes = [
  "call_scheduled",
  "call_dialed",
  "call_answered",
  "check_in_completed",
  "call_no_answer",
  "call_voicemail",
  "call_failed",
  "call_escalated",
  "guardrail_hit",
  "callback_requested",
  "patient_opted_out"
];

const EVENT_TYPE_SET = new Set(analyticsEventTypes);

export function createAnalyticsEvent({
  eventId,
  type,
  patientId,
  callSessionId,
  scheduleId,
  timestamp,
  metadata = {},
  source = "system"
}) {
  if (!EVENT_TYPE_SET.has(type)) {
    throw new Error(`Unsupported analytics event type: ${type}`);
  }

  if (!eventId || !patientId || !timestamp) {
    throw new Error("Analytics events require eventId, patientId, and timestamp.");
  }

  return {
    eventId,
    type,
    patientId,
    callSessionId: callSessionId || null,
    scheduleId: scheduleId || null,
    timestamp,
    metadata,
    source
  };
}

export function dedupeAnalyticsEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = event.eventId || [
      event.source,
      event.type,
      event.patientId,
      event.callSessionId,
      event.scheduleId,
      event.timestamp
    ].join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildAnalyticsEventsFromFixtures(dataset) {
  const events = [];

  for (const schedule of dataset.checkInSchedules) {
    if (schedule.nextRunAt) {
      events.push(createAnalyticsEvent({
        eventId: `event-${schedule.id}-scheduled`,
        type: "call_scheduled",
        patientId: schedule.patientId,
        scheduleId: schedule.id,
        timestamp: schedule.nextRunAt,
        metadata: {
          cadence: schedule.cadence,
          status: schedule.status,
          timeZone: schedule.timeZone
        },
        source: "scheduler"
      }));
    }
  }

  for (const call of dataset.callSessions) {
    events.push(createAnalyticsEvent({
      eventId: `event-${call.id}-dialed`,
      type: "call_dialed",
      patientId: call.patientId,
      callSessionId: call.id,
      scheduleId: call.scheduleId,
      timestamp: call.startedAt,
      metadata: {
        attemptNumber: call.attemptNumber,
        providerCallId: call.providerCallId
      },
      source: "voice_provider"
    }));

    if (["completed", "escalated", "opted_out"].includes(call.disposition)) {
      events.push(createAnalyticsEvent({
        eventId: `event-${call.id}-answered`,
        type: "call_answered",
        patientId: call.patientId,
        callSessionId: call.id,
        scheduleId: call.scheduleId,
        timestamp: call.startedAt,
        metadata: { disposition: call.disposition },
        source: "voice_provider"
      }));
    }

    const dispositionEventMap = {
      completed: "check_in_completed",
      no_answer: "call_no_answer",
      voicemail: "call_voicemail",
      escalated: "call_escalated",
      opted_out: "patient_opted_out"
    };
    const dispositionEvent = dispositionEventMap[call.disposition] || "call_failed";

    events.push(createAnalyticsEvent({
      eventId: `event-${call.id}-${dispositionEvent}`,
      type: dispositionEvent,
      patientId: call.patientId,
      callSessionId: call.id,
      scheduleId: call.scheduleId,
      timestamp: call.endedAt || call.startedAt,
      metadata: {
        disposition: call.disposition,
        status: call.status,
        durationSeconds: durationSeconds(call.startedAt, call.endedAt)
      },
      source: "voice_provider"
    }));

    if (call.failureReason) {
      events.push(createAnalyticsEvent({
        eventId: `event-${call.id}-failure`,
        type: "call_failed",
        patientId: call.patientId,
        callSessionId: call.id,
        scheduleId: call.scheduleId,
        timestamp: call.endedAt || call.startedAt,
        metadata: { failureReason: call.failureReason },
        source: "voice_provider"
      }));
    }
  }

  for (const escalation of dataset.escalations) {
    events.push(createAnalyticsEvent({
      eventId: `event-${escalation.id}`,
      type: "call_escalated",
      patientId: escalation.patientId,
      callSessionId: escalation.callSessionId,
      timestamp: escalation.createdAt,
      metadata: {
        priority: escalation.priority,
        status: escalation.status,
        reason: escalation.reason
      },
      source: "care_operations"
    }));
  }

  for (const turn of dataset.transcriptTurns) {
    if (turn.intent === "safe_escalation_fallback" || turn.intent === "urgent_symptom") {
      const call = dataset.callSessions.find((session) => session.id === turn.callSessionId);
      events.push(createAnalyticsEvent({
        eventId: `event-${turn.id}-guardrail`,
        type: "guardrail_hit",
        patientId: call?.patientId,
        callSessionId: turn.callSessionId,
        timestamp: turn.startedAt,
        metadata: {
          intent: turn.intent,
          stateBefore: turn.stateBefore,
          stateAfter: turn.stateAfter
        },
        source: "voice_runtime"
      }));
    }

    if (/callback/i.test(turn.text || "")) {
      const call = dataset.callSessions.find((session) => session.id === turn.callSessionId);
      events.push(createAnalyticsEvent({
        eventId: `event-${turn.id}-callback`,
        type: "callback_requested",
        patientId: call?.patientId,
        callSessionId: turn.callSessionId,
        timestamp: turn.startedAt,
        metadata: { intent: turn.intent },
        source: "voice_runtime"
      }));
    }
  }

  return dedupeAnalyticsEvents(events);
}

function durationSeconds(startedAt, endedAt) {
  const start = startedAt ? new Date(startedAt) : undefined;
  const end = endedAt ? new Date(endedAt) : undefined;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
}
