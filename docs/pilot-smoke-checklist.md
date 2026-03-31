# Pilot smoke checklist

Use this runbook when bringing up a fresh local environment or verifying a pilot deployment.

## 1. Install

```bash
npm install
cp .env.example .env
```

## 2. Configure environment

Minimum local values:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/voice_agent_dev
PGSSL=false
FRONTEND_PORT=3000
BACKEND_PORT=3001
INTAKE_API_BASE_URL=http://127.0.0.1:3001
APP_NAME=voice-agent-backend
STAFF_AUTH_MODE=legacy
# For legacy pilot mode only:
STAFF_ACCESS_TOKEN=replace-with-a-long-random-staff-access-code
# For JWT mode:
JWT_SECRET=replace-with-a-long-random-jwt-secret
```

## 3. Apply migrations

```bash
npm run db:migrate
```

## 4. Seed the first staff admin

Create the initial clinic admin account before attempting staff login:

```bash
npm run db:seed-staff -- --email admin@example.com --password 'ChangeMe123!' --display_name 'Clinic Admin' --role admin
```

Notes:
- the seed script is non-interactive and can also read `STAFF_USER_EMAIL`, `STAFF_USER_PASSWORD`, `STAFF_USER_DISPLAY_NAME`, and `STAFF_USER_ROLE` from `.env`
- the script is idempotent; if the email already exists it prints a skip message and exits successfully

## 5. Start services

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

## 5. Verify service health

Backend health endpoint:

```bash
curl http://127.0.0.1:3001/health
```

Expected result: HTTP 200.

## 6. Verify basic pilot flow

### Patient flow

1. Open `http://127.0.0.1:3000/intake/start`.
2. Start a new intake session.
3. Fill required patient demographics.
4. Fill visit reason fields.
5. Complete required consent fields.
6. Save/autosave through the session flow.
7. Open the review page.
8. Verify missing required fields block submission when intentionally left blank.
9. Complete the missing fields.
10. Submit the intake successfully.
11. Confirm the completion page shows the submission/confirmation state.

### Staff flow

1. Open `http://127.0.0.1:3000/dashboard/intake`.
2. If the deployment is using `STAFF_AUTH_MODE=legacy`, unlock the dashboard with the shared `STAFF_ACCESS_TOKEN` flow.
3. If the deployment is using `STAFF_AUTH_MODE=jwt`, sign in with a seeded staff user account.
4. Open the submitted intake.
5. Add optional review notes.
6. Mark the session reviewed.

### Staff account management

- **Create the first admin**
  ```bash
  npm run db:seed-staff -- --email admin@example.com --password 'ChangeMe123!' --display_name 'Clinic Admin' --role admin
  ```
- **Add more staff users**
  ```bash
  npm run db:seed-staff -- --email nurse@example.com --password 'AnotherChangeMe123!' --display_name 'Nurse Example' --role staff
  ```
- **Deactivate a user for now**
  ```sql
  UPDATE staff_users
  SET is_active = false
  WHERE email = 'nurse@example.com';
  ```

### PDF flow

1. Capture the `publicSessionId` from the submitted intake.
2. Open `http://127.0.0.1:3000/api/staff/sessions/<publicSessionId>/pdf`.
3. Confirm the browser downloads/renders a PDF summary.
4. Do not use the backend PDF URL directly in a browser; that route requires the `x-staff-access-token` header and is intended to be accessed through the frontend staff proxy.

## 7. Exit criteria

Pilot setup is considered healthy when:

- migrations run without prompts or manual edits
- backend starts with `.env` only
- frontend loads and can reach backend APIs
- intake can be created, saved, reviewed, submitted, and staff-reviewed
- PDF summary renders for a submitted session
- staff login works for the configured auth mode (`legacy` shared token or `jwt` per-user login)
