function buildAuditEvent({ intakeSessionId, actorType, eventType, eventPayload = {} }) {
  if (!intakeSessionId) throw new Error('intakeSessionId_required');
  if (!actorType) throw new Error('actorType_required');
  if (!eventType) throw new Error('eventType_required');

  return {
    id: `audit_${Date.now()}`,
    intake_session_id: intakeSessionId,
    actor_type: actorType,
    event_type: eventType,
    event_payload: JSON.stringify(eventPayload),
    created_at: new Date().toISOString(),
  };
}

module.exports = {
  buildAuditEvent,
};
