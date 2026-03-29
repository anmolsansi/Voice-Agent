const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run database migrations.');
}

const sslEnabled = /^true$/i.test(process.env.PGSSL || 'false');

module.exports = {
  databaseUrl: sslEnabled
    ? {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
      }
    : databaseUrl,
  dir: path.resolve(process.cwd(), 'db/migrations'),
  migrationsTable: 'pgmigrations',
  schema: 'public',
  createSchema: false,
};
