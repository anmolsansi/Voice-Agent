# Database migrations

This project uses [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) for Postgres schema changes.

## Local setup

1. Copy the example env file.
   ```bash
   cp .env.example .env
   ```
2. Update `DATABASE_URL` to point at your local Postgres instance.
3. Install dependencies.
   ```bash
   npm install
   ```
4. Run the baseline migration.
   ```bash
   npm run db:migrate
   ```

## Commands

- `npm run db:migrate` - apply pending migrations
- `npm run db:rollback` - roll back the most recent migration
- `npm run db:rollback:all` - roll back all applied migrations
- `npm run db:create -- <migration-name>` - create a new timestamped migration file

## Notes

- Credentials come from `DATABASE_URL`; nothing is hardcoded.
- Set `PGSSL=true` when you need SSL for hosted Postgres.
- The baseline migration creates the first core tables: `patients`, `intake_sessions`, `responses`, `validation_events`, and `audit_logs`.
