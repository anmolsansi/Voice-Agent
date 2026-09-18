exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM checkin_schedules s LEFT JOIN patients p ON p.id::text=s.patient_id WHERE p.id IS NULL)
        OR EXISTS (SELECT 1 FROM call_attempts a LEFT JOIN patients p ON p.id::text=a.patient_id
          LEFT JOIN checkin_schedules s ON s.id::text=a.schedule_id WHERE p.id IS NULL OR s.id IS NULL OR s.patient_id<>a.patient_id) THEN
        RAISE EXCEPTION 'FOUNDATION_ORPHANS: map patient/schedule UUID references explicitly before migration';
      END IF;
      IF EXISTS (SELECT 1 FROM calls c LEFT JOIN call_attempts a ON a.id::text=c.metadata->>'attemptId' WHERE a.id IS NULL) THEN
        RAISE EXCEPTION 'FOUNDATION_UNMAPPED_DETAILS: supply explicit calls.metadata.attemptId mappings before migration';
      END IF;
    END $$;
    ALTER TABLE checkin_schedules ALTER patient_id TYPE uuid USING patient_id::uuid;
    ALTER TABLE checkin_schedules ADD CONSTRAINT schedules_patient_fk FOREIGN KEY(patient_id) REFERENCES patients(id);
    ALTER TABLE checkin_schedules ADD CONSTRAINT schedules_id_patient_unique UNIQUE(id,patient_id);
    ALTER TABLE call_attempts ALTER patient_id TYPE uuid USING patient_id::uuid;
    ALTER TABLE call_attempts ALTER schedule_id TYPE uuid USING schedule_id::uuid;
    ALTER TABLE call_attempts ADD CONSTRAINT attempts_patient_fk FOREIGN KEY(patient_id) REFERENCES patients(id);
    ALTER TABLE call_attempts ADD CONSTRAINT attempts_schedule_patient_fk FOREIGN KEY(schedule_id,patient_id) REFERENCES checkin_schedules(id,patient_id);
    ALTER TABLE call_attempts ADD CONSTRAINT attempts_number_unique UNIQUE(schedule_id,attempt_number);
    ALTER TABLE call_attempts ADD COLUMN creation_input jsonb NOT NULL DEFAULT '{}';
    ALTER TABLE call_attempts ADD COLUMN last_transition jsonb;
    ALTER TABLE calls ADD COLUMN attempt_id uuid;
    UPDATE calls SET attempt_id=(metadata->>'attemptId')::uuid;
    ALTER TABLE calls ALTER attempt_id SET NOT NULL;
    ALTER TABLE calls ADD CONSTRAINT calls_attempt_unique UNIQUE(attempt_id);
    ALTER TABLE calls ADD CONSTRAINT calls_attempt_fk FOREIGN KEY(attempt_id) REFERENCES call_attempts(id);
  `);
};
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE calls DROP COLUMN attempt_id;
    ALTER TABLE call_attempts DROP COLUMN last_transition, DROP COLUMN creation_input;
    ALTER TABLE call_attempts DROP CONSTRAINT attempts_number_unique, DROP CONSTRAINT attempts_patient_fk, DROP CONSTRAINT attempts_schedule_patient_fk;
    ALTER TABLE checkin_schedules DROP CONSTRAINT schedules_patient_fk, DROP CONSTRAINT schedules_id_patient_unique;
    ALTER TABLE call_attempts ALTER patient_id TYPE text USING patient_id::text, ALTER schedule_id TYPE text USING schedule_id::text;
    ALTER TABLE checkin_schedules ALTER patient_id TYPE text USING patient_id::text;
  `);
};
