const path = require('path');
const dotenv = require('dotenv');
const { runner } = require('node-pg-migrate');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const action = process.argv[2] || 'up';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to run database migrations.');
  process.exit(1);
}

const sslEnabled = /^true$/i.test(process.env.PGSSL || 'false');

const sharedOptions = {
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
  count: action === 'down-all' ? Infinity : 1,
  direction: action === 'up' ? 'up' : 'down',
  verbose: true,
};

async function main() {
  if (!['up', 'down', 'down-all'].includes(action)) {
    throw new Error(`Unsupported migration action: ${action}`);
  }

  const results = await runner(sharedOptions);
  const summary = Array.isArray(results) ? results.map((item) => item.name).join(', ') : '';
  console.log(summary ? `Completed migrations: ${summary}` : 'No migrations were run.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
