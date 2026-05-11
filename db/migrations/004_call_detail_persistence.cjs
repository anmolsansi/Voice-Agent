/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('calls', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    public_call_id: { type: 'text', notNull: true },
    intake_session_id: {
      type: 'uuid',
      references: 'intake_session_state',
      onDelete: 'set null',
    },
    provider: { type: 'text', notNull: true, default: 'unknown' },
    provider_call_id: { type: 'text' },
    direction: { type: 'text', notNull: true, default: 'outbound' },
    status: { type: 'text', notNull: true, default: 'created' },
    transcript_status: { type: 'text', notNull: true, default: 'unavailable' },
    transcript_unavailable_reason: { type: 'text' },
    started_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
    ended_at: { type: 'timestamptz' },
    outcome: { type: 'jsonb', notNull: true, default: '{}' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('calls', 'calls_direction_check', {
    check: "direction in ('inbound', 'outbound')",
  });
  pgm.addConstraint('calls', 'calls_transcript_status_check', {
    check: "transcript_status in ('unavailable', 'delayed', 'empty', 'partial', 'complete', 'deleted')",
  });
  pgm.createIndex('calls', 'public_call_id', { unique: true });
  pgm.createIndex('calls', ['provider', 'provider_call_id']);
  pgm.createIndex('calls', 'intake_session_id');
  pgm.createIndex('calls', 'started_at');

  pgm.createTable('call_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    call_id: { type: 'uuid', notNull: true, references: 'calls', onDelete: 'cascade' },
    event_type: { type: 'text', notNull: true },
    source: { type: 'text', notNull: true, default: 'system' },
    sequence: { type: 'integer', notNull: true, default: 0 },
    occurred_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
    provider_event_id: { type: 'text' },
    raw_payload_ref: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('call_events', ['call_id', 'occurred_at', 'sequence']);
  pgm.createIndex('call_events', ['call_id', 'source', 'provider_event_id'], { unique: true });

  pgm.createTable('transcript_turns', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    call_id: { type: 'uuid', notNull: true, references: 'calls', onDelete: 'cascade' },
    speaker: { type: 'text', notNull: true, default: 'unknown' },
    text: { type: 'text', notNull: true, default: '' },
    sequence: { type: 'integer', notNull: true, default: 0 },
    started_at: { type: 'timestamptz' },
    ended_at: { type: 'timestamptz' },
    confidence: { type: 'numeric' },
    prompt_id: { type: 'text' },
    state_id: { type: 'text' },
    is_partial: { type: 'boolean', notNull: true, default: false },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('transcript_turns', 'transcript_turns_speaker_check', {
    check: "speaker in ('patient', 'agent', 'system', 'unknown')",
  });
  pgm.createIndex('transcript_turns', ['call_id', 'started_at', 'sequence']);

  pgm.createTable('recording_metadata', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    call_id: { type: 'uuid', notNull: true, references: 'calls', onDelete: 'cascade' },
    provider_recording_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'unavailable' },
    url: { type: 'text' },
    url_stored: { type: 'boolean', notNull: true, default: false },
    duration_seconds: { type: 'numeric' },
    format: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('recording_metadata', ['call_id', 'provider_recording_id'], { unique: true });

  pgm.createTable('call_audit_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    call_id: { type: 'uuid', notNull: true, references: 'calls', onDelete: 'cascade' },
    actor_type: { type: 'text', notNull: true, default: 'system' },
    actor_id: { type: 'text' },
    action: { type: 'text', notNull: true },
    entity_type: { type: 'text', notNull: true },
    entity_id: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('call_audit_logs', ['call_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('call_audit_logs');
  pgm.dropTable('recording_metadata');
  pgm.dropTable('transcript_turns');
  pgm.dropTable('call_events');
  pgm.dropTable('calls');
};
