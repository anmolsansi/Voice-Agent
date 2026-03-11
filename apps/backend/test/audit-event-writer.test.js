const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAuditEvent } = require('../src/audit/event-writer');

test('buildAuditEvent returns audit_logs-aligned payload', () => {
  const event = buildAuditEvent({
    intakeSessionId: 'session_123',
    actorType: 'system',
    eventType: 'voice_mapping_applied',
    eventPayload: { fieldKey: 'chief_complaint', source: 'voice' },
  });

  assert.equal(event.intake_session_id, 'session_123');
  assert.equal(event.actor_type, 'system');
  assert.equal(event.event_type, 'voice_mapping_applied');
  assert.equal(typeof event.event_payload, 'string');
  assert.ok(event.id.startsWith('audit_'));
});

test('buildAuditEvent validates required inputs', () => {
  assert.throws(() => buildAuditEvent({ actorType: 'system', eventType: 'x' }), /intakeSessionId_required/);
  assert.throws(() => buildAuditEvent({ intakeSessionId: 's', eventType: 'x' }), /actorType_required/);
  assert.throws(() => buildAuditEvent({ intakeSessionId: 's', actorType: 'system' }), /eventType_required/);
});
