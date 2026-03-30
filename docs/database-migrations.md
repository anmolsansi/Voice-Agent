# Database migrations

This project uses [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) for Postgres schema changes.

## Prerequisites

- `.env` exists at the repo root
- `DATABASE_URL` points at the target Postgres database
- `PGSSL=true` only when your Postgres provider requires SSL

## Setup

1. Copy the example env file.
   ```bash
   cp .env.example .env
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Create the local database if needed.
   ```bash
   createdb voice_agent_dev
   ```
4. Apply all pending migrations.
   ```bash
   npm run db:migrate
   ```

## Commands

- `npm run db:migrate` - apply pending migrations
- `npm run db:rollback` - roll back the most recent migration
- `npm run db:rollback:all` - roll back all applied migrations
- `npm run db:create -- <migration-name>` - create a new timestamped migration file in `db/migrations`

## Behavior notes

- The migration wrapper lives in `db/run-migrations.cjs`.
- Credentials come from `DATABASE_URL`; nothing is hardcoded.
- The migration runner loads `.env` from the repo root.
- Set `PGSSL=true` to connect with SSL and `rejectUnauthorized: false` for hosted/shared environments that require it.
- The baseline migrations create the core intake/session persistence tables used by the pilot flow.
