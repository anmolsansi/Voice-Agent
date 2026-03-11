const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAuditEvent } = require('../src/audit/event-writer');
const { toAuditLogInsert } = require('../src/audit/persistence-adapter');

test('toAuditLogInsert returns insert-ready query payload', () => {
  const event = buildAuditEvent({
    intakeSessionId: 'session_abc',
    actorType: 'system',
    eventType: 'validation_completed',
    eventPayload: { valid: true },
  });

  const query = toAuditLogInsert(event);
  assert.match(query.text, /INSERT INTO audit_logs/i);
  assert.equal(query.values.length, 6);
  assert.equal(query.values[1], 'session_abc');
});

test('toAuditLogInsert enforces required fields', () => {
  assert.throws(() => toAuditLogInsert(null), /event_required/);
  assert.throws(() => toAuditLogInsert({ id: 'x' }), /intake_session_id_required/);
});
