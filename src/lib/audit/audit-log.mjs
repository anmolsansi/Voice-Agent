export function createAuditEvent({ actorId = "system", action, resourceType, resourceId, metadata = {}, at = new Date().toISOString() }) {
  return {
    id: `audit-${resourceType}-${resourceId}-${at.replace(/[-:.TZ]/g, "")}`,
    actorId,
    action,
    resourceType,
    resourceId,
    metadata: sanitizeMetadata(metadata),
    timestamp: at
  };
}

export function appendAuditEvent(auditEvents, event) {
  return [...auditEvents, event];
}

function sanitizeMetadata(metadata) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !/secret|token|key|password|transcript/i.test(key))
  );
}
