const test = require('node:test');
const assert = require('node:assert/strict');

const { getConfig, resetConfigForTests } = require('./env');

const MANAGED_ENV_KEYS = [
  'AI_PROVIDER',
  'AI_PROVIDER_API_KEY',
  'ALLOW_MEMORY_FALLBACK',
  'APP_URL',
  'BACKEND_PORT',
  'DATABASE_URL',
  'FEATURE_CALL_SIMULATION',
  'FEATURE_VOICE_INTAKE',
  'FEATURE_WEBHOOK_SIMULATION',
  'INTAKE_API_BASE_URL',
  'JWT_SECRET',
  'LOG_LEVEL',
  'NODE_ENV',
  'PGSSL',
  'PORT',
  'PROVIDER_RECORDING_URLS_ENABLED',
  'STAFF_ACCESS_TOKEN',
  'STAFF_AUTH_MODE',
  'STORE_RECORDING_URLS',
  'STT_PROVIDER',
  'TELEPHONY_API_KEY',
  'TELEPHONY_AUTH_TOKEN',
  'TELEPHONY_FROM_NUMBER',
  'TELEPHONY_PROVIDER',
  'TTS_PROVIDER',
  'WEBHOOK_SIGNING_SECRET',
  'WEBHOOK_TUNNEL_URL',
];

function withCleanEnv(callback) {
  const previous = new Map(MANAGED_ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of MANAGED_ENV_KEYS) {
    delete process.env[key];
  }
  resetConfigForTests();

  return Promise.resolve()
    .then(callback)
    .finally(() => {
      for (const key of MANAGED_ENV_KEYS) {
        const value = previous.get(key);
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      resetConfigForTests();
    });
}

test('getConfig returns typed local defaults without exposing secret values through public config', async () => {
  await withCleanEnv(() => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/voice_agent_dev';
    process.env.STAFF_AUTH_MODE = 'legacy';
    process.env.STAFF_ACCESS_TOKEN = 'local-only-staff-token';

    const config = getConfig();

    assert.equal(config.nodeEnv, 'development');
    assert.equal(config.port, 3001);
    assert.equal(config.telephony.provider, 'mock');
    assert.equal(config.ai.provider, 'mock');
    assert.equal(config.features.voiceIntake, true);
    assert.equal(config.databaseUrl, 'postgres://postgres:postgres@localhost:5432/voice_agent_dev');
  });
});

test('getConfig fails fast for missing production database URL', async () => {
  await withCleanEnv(() => {
    process.env.NODE_ENV = 'production';
    process.env.STAFF_AUTH_MODE = 'legacy';
    process.env.STAFF_ACCESS_TOKEN = 'production-staff-token';

    assert.throws(() => getConfig({ strict: true }), /DATABASE_URL is required when NODE_ENV=production/);
  });
});

test('getConfig requires provider secrets when non-mock integrations are selected', async () => {
  await withCleanEnv(() => {
    process.env.NODE_ENV = 'development';
    process.env.STAFF_AUTH_MODE = 'jwt';
    process.env.TELEPHONY_PROVIDER = 'twilio';
    process.env.AI_PROVIDER = 'openai';

    assert.throws(
      () => getConfig(),
      /JWT_SECRET is required.*TELEPHONY_AUTH_TOKEN is required.*AI_PROVIDER_API_KEY is required/s,
    );
  });
});
