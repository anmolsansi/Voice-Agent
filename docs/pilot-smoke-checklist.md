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
```

## 3. Apply migrations

```bash
npm run db:migrate
```

## 4. Start services

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
2. Open the submitted intake.
3. Add optional review notes.
4. Mark the session reviewed.

### PDF flow

1. Capture the `publicSessionId` from the submitted intake.
2. Open `http://127.0.0.1:3001/api/intake/sessions/<publicSessionId>/pdf`.
3. Confirm the browser downloads/renders a PDF summary.

## 7. Exit criteria

Pilot setup is considered healthy when:

- migrations run without prompts or manual edits
- backend starts with `.env` only
- frontend loads and can reach backend APIs
- intake can be created, saved, reviewed, submitted, and staff-reviewed
- PDF summary renders for a submitted session
