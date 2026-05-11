/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('checkin_schedules', {
    id: { type: 'uuid', primaryKey: true },
    patient_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'active' },
    timezone: { type: 'text', notNull: true, default: 'UTC' },
    next_due_at: { type: 'timestamptz', notNull: true },
    retry_count: { type: 'integer', notNull: true, default: 0 },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('checkin_schedules', 'checkin_schedules_status_check', {
    check: "status in ('active', 'paused', 'completed', 'canceled')",
  });

  pgm.createTable('call_attempts', {
    id: { type: 'uuid', primaryKey: true },
    patient_id: { type: 'text', notNull: true },
    schedule_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    attempt_number: { type: 'integer', notNull: true },
    provider_call_id: { type: 'text' },
    provider_conversation_id: { type: 'text' },
    transcript_status: { type: 'text', notNull: true, default: 'not_started' },
    outcome: { type: 'text' },
    escalation_flag: { type: 'boolean', notNull: true, default: false },
    idempotency_key: { type: 'text' },
    queued_at: { type: 'timestamptz' },
    started_at: { type: 'timestamptz' },
    ended_at: { type: 'timestamptz' },
    canceled_at: { type: 'timestamptz' },
    error_code: { type: 'text' },
    error_message: { type: 'text' },
    error_details: { type: 'jsonb', notNull: true, default: '{}' },
    outcome_summary: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('call_attempts', 'call_attempts_status_check', {
    check: "status in ('queued', 'starting', 'in_progress', 'completed', 'failed', 'canceled', 'finalizing')",
  });

  pgm.addConstraint('call_attempts', 'call_attempts_transcript_status_check', {
    check: "transcript_status in ('not_started', 'pending', 'ready', 'failed')",
  });

  pgm.addConstraint('call_attempts', 'call_attempts_attempt_number_check', {
    check: 'attempt_number > 0',
  });

  pgm.createIndex('checkin_schedules', ['status', 'next_due_at']);
  pgm.createIndex('checkin_schedules', 'patient_id');
  pgm.createIndex('call_attempts', ['patient_id', 'created_at']);
  pgm.createIndex('call_attempts', ['schedule_id', 'created_at']);
  pgm.createIndex('call_attempts', 'status');
  pgm.createIndex('call_attempts', 'idempotency_key', { unique: true, where: 'idempotency_key is not null' });
};

exports.down = (pgm) => {
  pgm.dropTable('call_attempts');
  pgm.dropTable('checkin_schedules');
};
