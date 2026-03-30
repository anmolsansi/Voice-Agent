# Voice-Agent pilot setup

Voice-Agent is a Next.js frontend plus a small Node HTTP backend for intake session APIs and PDF generation.

This repo now includes runnable migration scripts and a pilot-focused startup path so a fresh environment can be stood up with minimal guesswork.

## Stack

- Frontend: Next.js 14
- Backend API: Node.js HTTP server in `src/server.js`
- Database: PostgreSQL
- Migrations: `node-pg-migrate`

## Local prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Environment model

The frontend and backend are separate runtimes.

- `FRONTEND_PORT` controls the Next.js app port.
- `BACKEND_PORT` controls the Node backend port.
- `INTAKE_API_BASE_URL` tells the frontend where the backend lives.
- `DATABASE_URL` is only used by the backend/migration layer.

For local development, keep these aligned:

```env
FRONTEND_PORT=3000
BACKEND_PORT=3001
INTAKE_API_BASE_URL=http://127.0.0.1:3001
```

## Quick start

1. Copy env and adjust values as needed.
   ```bash
   cp .env.example .env
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Create the local database if it does not exist yet.
   ```bash
   createdb voice_agent_dev
   ```
4. Apply migrations.
   ```bash
   npm run db:migrate
   ```
5. Start the backend in terminal 1.
   ```bash
   npm run dev:backend
   ```
6. Start the frontend in terminal 2.
   ```bash
   npm run dev:frontend
   ```
7. Open the app.
   - Frontend: `http://127.0.0.1:3000`
   - Backend health: `http://127.0.0.1:3001/health`

## Package scripts

### App runtime

- `npm run dev:frontend` - start Next.js locally on `FRONTEND_PORT`
- `npm run dev:backend` - start backend locally on `BACKEND_PORT`
- `npm run build` - build the frontend
- `npm run start:frontend` - run built frontend on `FRONTEND_PORT`
- `npm run start:backend` - run backend on `BACKEND_PORT`
- `npm test` - run backend node tests

### Database

- `npm run db:migrate` - apply pending migrations
- `npm run db:rollback` - roll back the latest migration
- `npm run db:rollback:all` - roll back all migrations
- `npm run db:create -- <name>` - create a new migration file

## Pilot startup runbook

### 1) Install

```bash
npm install
cp .env.example .env
```

### 2) Configure env

Required for local pilot testing:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/voice_agent_dev
PGSSL=false
FRONTEND_PORT=3000
BACKEND_PORT=3001
INTAKE_API_BASE_URL=http://127.0.0.1:3001
APP_NAME=voice-agent-backend
```

### 3) Run migrations

```bash
npm run db:migrate
```

Expected result: pending migrations apply cleanly and the `pgmigrations` table is created.

### 4) Start backend

```bash
npm run dev:backend
```

Expected log:

```text
voice-agent-backend listening on port 3001
```

### 5) Start frontend

```bash
npm run dev:frontend
```

Open `http://127.0.0.1:3000`.

### 6) Verify health

Backend:

```bash
curl http://127.0.0.1:3001/health
```

Expected: HTTP 200 response.

Optional API smoke:

```bash
curl -X POST http://127.0.0.1:3001/api/intake/sessions
```

Expected: JSON payload with a new intake session id/public session id.

### 7) Pilot smoke checklist

Use this exact flow before a pilot/demo:

1. Open `http://127.0.0.1:3000/intake/start`.
2. Create a new intake session.
3. Enter enough demographics/visit-reason/consent fields to allow saving.
4. Confirm autosave/manual save behavior works while moving between sections.
5. Continue to review.
6. Verify incomplete required fields are called out if anything is missing.
7. Complete all required fields and submit the intake.
8. Confirm completion page loads with confirmation details.
9. Open the staff dashboard at `http://127.0.0.1:3000/dashboard/intake`.
10. Open the submitted intake, add review notes, and mark it reviewed.
11. Open the generated PDF summary route for that session and confirm it renders.

## Deployment notes

- Run frontend and backend as separate processes.
- Do not reuse `PORT` for both services; use `FRONTEND_PORT` and `BACKEND_PORT` explicitly.
- In hosted environments, set `INTAKE_API_BASE_URL` to the backend's reachable URL.
- Set `PGSSL=true` when your Postgres provider requires SSL.

## Related docs

- `docs/database-migrations.md`
- `docs/pilot-smoke-checklist.md`
