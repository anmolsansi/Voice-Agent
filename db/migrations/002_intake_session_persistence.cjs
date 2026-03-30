/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('intake_session_state', {
    id: { type: 'uuid', primaryKey: true },
    public_session_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'active' },
    source_mode: { type: 'text', notNull: true, default: 'manual' },
    started_at: { type: 'timestamptz', notNull: true },
    updated_at: { type: 'timestamptz', notNull: true },
    expires_at: { type: 'timestamptz' },
    submitted_at: { type: 'timestamptz' },
    reviewed_at: { type: 'timestamptz' },
    review_notes: { type: 'text' },
    completion_summary: { type: 'jsonb', notNull: true, default: '{}' },
    sections: { type: 'jsonb', notNull: true, default: '[]' },
    fields: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('intake_session_state', 'intake_session_state_status_check', {
    check: "status in ('active', 'submitted', 'reviewed')",
  });

  pgm.addConstraint('intake_session_state', 'intake_session_state_source_mode_check', {
    check: "source_mode in ('manual', 'voice', 'hybrid')",
  });

  pgm.createIndex('intake_session_state', 'public_session_id', { unique: true });
  pgm.createIndex('intake_session_state', 'status');
  pgm.createIndex('intake_session_state', 'updated_at');

  pgm.createTable('intake_session_submissions', {
    submission_id: { type: 'text', primaryKey: true },
    session_id: {
      type: 'uuid',
      notNull: true,
      references: 'intake_session_state',
      onDelete: 'cascade',
    },
    status: { type: 'text', notNull: true, default: 'submitted' },
    submitted_at: { type: 'timestamptz', notNull: true },
    payload: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('intake_session_submissions', 'session_id', { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('intake_session_submissions');
  pgm.dropTable('intake_session_state');
};
