-- Voice-Agent intake domain baseline schema

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS intake_sessions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'incomplete_required', 'ready_for_review', 'submitted')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  intake_session_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  value_text TEXT,
  source TEXT NOT NULL CHECK (source IN ('voice', 'manual', 'system')),
  is_valid INTEGER NOT NULL DEFAULT 0 CHECK (is_valid IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (intake_session_id, field_key),
  FOREIGN KEY (intake_session_id) REFERENCES intake_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS validation_events (
  id TEXT PRIMARY KEY,
  intake_session_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
  result TEXT NOT NULL CHECK (result IN ('valid', 'invalid', 'manual_required')),
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (intake_session_id) REFERENCES intake_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  intake_session_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('patient', 'staff', 'system')),
  event_type TEXT NOT NULL,
  event_payload TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (intake_session_id) REFERENCES intake_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_intake_sessions_patient_id ON intake_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_responses_intake_session_id ON responses(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_validation_events_session_field ON validation_events(intake_session_id, field_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(intake_session_id);
