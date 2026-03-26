const path = require('path');
const dotenv = require('dotenv');

let loaded = false;

function loadEnv() {
  if (loaded) {
    return;
  }

  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  loaded = true;
}

function getConfig() {
  loadEnv();

  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number.parseInt(process.env.PORT || '3001', 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a positive integer when provided.');
  }

  return {
    nodeEnv,
    port,
    appName: process.env.APP_NAME || 'voice-agent-backend',
    databaseUrl: process.env.DATABASE_URL,
    pgSsl: /^true$/i.test(process.env.PGSSL || 'false'),
  };
}

module.exports = {
  getConfig,
};
