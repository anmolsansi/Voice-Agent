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
  const port = Number.parseInt(process.env.BACKEND_PORT || process.env.PORT || '3001', 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('BACKEND_PORT must be a positive integer when provided.');
  }

  return {
    nodeEnv,
    port,
    appName: process.env.APP_NAME || 'voice-agent-backend',
    databaseUrl: process.env.DATABASE_URL,
    pgSsl: /^true$/i.test(process.env.PGSSL || 'false'),
    allowMemoryFallback: /^true$/i.test(process.env.ALLOW_MEMORY_FALLBACK || 'false'),
    storeRecordingUrls: /^true$/i.test(process.env.STORE_RECORDING_URLS || 'false'),
    providerRecordingUrlsEnabled: /^true$/i.test(process.env.PROVIDER_RECORDING_URLS_ENABLED || 'false'),
  };
}

module.exports = {
  getConfig,
};
