function toAuditLogInsert(event) {
  if (!event || typeof event !== 'object') throw new Error('event_required');
  const required = ['id', 'intake_session_id', 'actor_type', 'event_type', 'event_payload', 'created_at'];
  for (const key of required) {
    if (!event[key]) throw new Error(`${key}_required`);
  }

  return {
    text: `INSERT INTO audit_logs (id, intake_session_id, actor_type, event_type, event_payload, created_at)
VALUES ($1, $2, $3, $4, $5, $6)`,
    values: [
      event.id,
      event.intake_session_id,
      event.actor_type,
      event.event_type,
      event.event_payload,
      event.created_at,
    ],
  };
}

module.exports = {
  toAuditLogInsert,
};
