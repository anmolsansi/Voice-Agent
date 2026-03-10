-- Seed-safe baseline records for local development
-- Uses INSERT OR IGNORE to avoid duplicate collisions on repeated runs.

INSERT OR IGNORE INTO patients (id, first_name, last_name, date_of_birth, phone)
VALUES ('patient_seed_001', 'Demo', 'Patient', '1990-01-01', '555-0100');

INSERT OR IGNORE INTO intake_sessions (id, patient_id, status)
VALUES ('session_seed_001', 'patient_seed_001', 'in_progress');
