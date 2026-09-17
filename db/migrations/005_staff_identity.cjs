exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE staff_users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
      display_name text NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL CHECK (role IN ('admin', 'care_staff')),
      disabled boolean NOT NULL DEFAULT false,
      must_change_password boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE staff_sessions (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_seen_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL DEFAULT now() + interval '12 hours'
    );
    CREATE INDEX ON staff_sessions(user_id);
    CREATE INDEX ON staff_sessions(expires_at);
    CREATE TABLE login_limits (
      bucket text PRIMARY KEY,
      attempts integer NOT NULL DEFAULT 0,
      window_start timestamptz NOT NULL DEFAULT now()
    );
  `);
};
exports.down = (pgm) => {
  pgm.sql('DROP TABLE login_limits; DROP TABLE staff_sessions; DROP TABLE staff_users;');
};
