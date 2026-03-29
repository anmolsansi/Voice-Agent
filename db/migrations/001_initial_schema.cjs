/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('patients', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    first_name: { type: 'text', notNull: true },
    last_name: { type: 'text', notNull: true },
    date_of_birth: { type: 'date', notNull: true },
    phone: { type: 'text' },
    email: { type: 'text' },
    preferred_language: { type: 'text', notNull: true, default: 'en' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('intake_sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    patient_id: {
      type: 'uuid',
      notNull: true,
      references: 'patients',
      onDelete: 'cascade',
    },
    status: { type: 'text', notNull: true, default: 'in_progress' },
    channel: { type: 'text', notNull: true, default: 'voice' },
    started_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    submitted_at: { type: 'timestamptz' },
    last_activity_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('responses', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    intake_session_id: {
      type: 'uuid',
      notNull: true,
      references: 'intake_sessions',
      onDelete: 'cascade',
    },
    field_key: { type: 'text', notNull: true },
    field_value: { type: 'jsonb', notNull: true, default: '{}' },
    source: { type: 'text', notNull: true, default: 'voice' },
    is_required: { type: 'boolean', notNull: true, default: false },
    is_complete: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('validation_events', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    intake_session_id: {
      type: 'uuid',
      notNull: true,
      references: 'intake_sessions',
      onDelete: 'cascade',
    },
    response_id: {
      type: 'uuid',
      references: 'responses',
      onDelete: 'set null',
    },
    field_key: { type: 'text', notNull: true },
    outcome: { type: 'text', notNull: true },
    reason: { type: 'text' },
    attempt_number: { type: 'integer', notNull: true, default: 1 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('audit_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    intake_session_id: {
      type: 'uuid',
      references: 'intake_sessions',
      onDelete: 'cascade',
    },
    actor_type: { type: 'text', notNull: true },
    actor_id: { type: 'text' },
    action: { type: 'text', notNull: true },
    entity_type: { type: 'text', notNull: true },
    entity_id: { type: 'uuid' },
    metadata: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('intake_sessions', 'intake_sessions_status_check', {
    check: "status in ('in_progress', 'incomplete_required', 'ready_for_review', 'submitted', 'expired')",
  });

  pgm.addConstraint('intake_sessions', 'intake_sessions_channel_check', {
    check: "channel in ('voice', 'manual', 'hybrid')",
  });

  pgm.addConstraint('responses', 'responses_source_check', {
    check: "source in ('voice', 'manual', 'staff', 'system')",
  });

  pgm.createIndex('intake_sessions', 'patient_id');
  pgm.createIndex('intake_sessions', 'status');
  pgm.createIndex('responses', ['intake_session_id', 'field_key'], {
    unique: true,
  });
  pgm.createIndex('validation_events', ['intake_session_id', 'field_key']);
  pgm.createIndex('audit_logs', ['intake_session_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('audit_logs');
  pgm.dropTable('validation_events');
  pgm.dropTable('responses');
  pgm.dropTable('intake_sessions');
  pgm.dropTable('patients');
};
