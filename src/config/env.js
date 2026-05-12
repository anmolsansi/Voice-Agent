const path = require('path');
const dotenv = require('dotenv');

let loaded = false;

const NODE_ENVS = new Set(['development', 'test', 'production']);
const LOG_LEVELS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'silent']);
const STAFF_AUTH_MODES = new Set(['legacy', 'jwt']);
const TELEPHONY_PROVIDERS = new Set(['mock', 'twilio', 'telnyx']);
const AI_PROVIDERS = new Set(['mock', 'openai']);
const SPEECH_PROVIDERS = new Set(['web-speech', 'mock', 'openai', 'deepgram', 'elevenlabs']);

/**
 * @typedef {Object} RuntimeConfig
 * @property {'development'|'test'|'production'} nodeEnv
 * @property {number} port
 * @property {string} appName
 * @property {string} appUrl
 * @property {string|undefined} databaseUrl
 * @property {boolean} pgSsl
 * @property {boolean} allowMemoryFallback
 * @property {string} intakeApiBaseUrl
 * @property {'trace'|'debug'|'info'|'warn'|'error'|'silent'} logLevel
 * @property {'legacy'|'jwt'} staffAuthMode
 * @property {string|undefined} jwtSecret
 * @property {string|undefined} staffAccessToken
 * @property {{provider:'mock'|'twilio'|'telnyx', accountSid?:string, authToken?:string, apiKey?:string, fromNumber?:string, webhookSigningSecret?:string, webhookTunnelUrl?:string}} telephony
 * @property {{provider:'mock'|'openai', apiKey?:string, model:string}} ai
 * @property {{provider:'web-speech'|'mock'|'openai'|'deepgram'|'elevenlabs', voice:string, language:string}} tts
 * @property {{provider:'web-speech'|'mock'|'openai'|'deepgram'|'elevenlabs', model:string, language:string}} stt
 * @property {{voiceIntake:boolean, callSimulation:boolean, webhookSimulation:boolean, recordingUrlStorage:boolean, providerRecordingUrls:boolean}} features
 * @property {boolean} storeRecordingUrls
 * @property {boolean} providerRecordingUrlsEnabled
 */

function loadEnv() {
  if (loaded) {
    return;
  }

  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
  loaded = true;
}

/**
 * Load and validate server runtime configuration.
 *
 * Keep this module server-only. Do not import it from client components or files
 * that are bundled for the browser because it intentionally reads secrets.
 *
 * @returns {RuntimeConfig}
 */
function getConfig(options = {}) {
  loadEnv();

  const errors = [];
  const nodeEnv = readEnum('NODE_ENV', process.env.NODE_ENV || 'development', NODE_ENVS, errors);
  const port = readPositiveInteger('BACKEND_PORT', process.env.BACKEND_PORT || process.env.PORT || '3001', errors);
  const appUrl = readUrl('APP_URL', process.env.APP_URL || 'http://127.0.0.1:3000', errors);
  const intakeApiBaseUrl = readUrl(
    'INTAKE_API_BASE_URL',
    process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${port || 3001}`,
    errors,
  );
  const databaseUrl = readOptionalUrl('DATABASE_URL', process.env.DATABASE_URL, errors);
  const staffAuthMode = readEnum('STAFF_AUTH_MODE', process.env.STAFF_AUTH_MODE || 'legacy', STAFF_AUTH_MODES, errors);
  const logLevel = readEnum('LOG_LEVEL', process.env.LOG_LEVEL || 'info', LOG_LEVELS, errors);
  const telephonyProvider = readEnum(
    'TELEPHONY_PROVIDER',
    process.env.TELEPHONY_PROVIDER || 'mock',
    TELEPHONY_PROVIDERS,
    errors,
  );
  const aiProvider = readEnum('AI_PROVIDER', process.env.AI_PROVIDER || 'mock', AI_PROVIDERS, errors);
  const ttsProvider = readEnum('TTS_PROVIDER', process.env.TTS_PROVIDER || 'web-speech', SPEECH_PROVIDERS, errors);
  const sttProvider = readEnum('STT_PROVIDER', process.env.STT_PROVIDER || 'web-speech', SPEECH_PROVIDERS, errors);
  const allowMemoryFallback = readBoolean('ALLOW_MEMORY_FALLBACK', process.env.ALLOW_MEMORY_FALLBACK || 'false', errors);
  const pgSsl = readBoolean('PGSSL', process.env.PGSSL || 'false', errors);
  const storeRecordingUrls = readBoolean('STORE_RECORDING_URLS', process.env.STORE_RECORDING_URLS || 'false', errors);
  const providerRecordingUrlsEnabled = readBoolean(
    'PROVIDER_RECORDING_URLS_ENABLED',
    process.env.PROVIDER_RECORDING_URLS_ENABLED || 'false',
    errors,
  );
  const voiceIntakeEnabled = readBoolean('FEATURE_VOICE_INTAKE', process.env.FEATURE_VOICE_INTAKE || 'true', errors);
  const callSimulationEnabled = readBoolean(
    'FEATURE_CALL_SIMULATION',
    process.env.FEATURE_CALL_SIMULATION || 'true',
    errors,
  );
  const webhookSimulationEnabled = readBoolean(
    'FEATURE_WEBHOOK_SIMULATION',
    process.env.FEATURE_WEBHOOK_SIMULATION || 'true',
    errors,
  );

  validateRequiredSecrets({
    strict: options.strict === true,
    aiProvider,
    databaseUrl,
    nodeEnv,
    staffAuthMode,
    telephonyProvider,
    ttsProvider,
    sttProvider,
    errors,
  });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }

  return {
    nodeEnv,
    port,
    appName: process.env.APP_NAME || 'voice-agent-backend',
    appUrl,
    databaseUrl,
    pgSsl,
    allowMemoryFallback,
    intakeApiBaseUrl,
    logLevel,
    staffAuthMode,
    jwtSecret: optionalTrim(process.env.JWT_SECRET),
    staffAccessToken: optionalTrim(process.env.STAFF_ACCESS_TOKEN),
    telephony: {
      provider: telephonyProvider,
      accountSid: optionalTrim(process.env.TELEPHONY_ACCOUNT_SID),
      authToken: optionalTrim(process.env.TELEPHONY_AUTH_TOKEN),
      apiKey: optionalTrim(process.env.TELEPHONY_API_KEY),
      fromNumber: optionalTrim(process.env.TELEPHONY_FROM_NUMBER),
      webhookSigningSecret: optionalTrim(process.env.WEBHOOK_SIGNING_SECRET),
      webhookTunnelUrl: optionalTrim(process.env.WEBHOOK_TUNNEL_URL),
    },
    ai: {
      provider: aiProvider,
      apiKey: optionalTrim(process.env.AI_PROVIDER_API_KEY),
      model: process.env.AI_MODEL || 'mock-intake-extractor',
    },
    tts: {
      provider: ttsProvider,
      voice: process.env.TTS_VOICE || 'default',
      language: process.env.TTS_LANGUAGE || 'en-US',
    },
    stt: {
      provider: sttProvider,
      model: process.env.STT_MODEL || 'browser-default',
      language: process.env.STT_LANGUAGE || 'en-US',
    },
    features: {
      voiceIntake: voiceIntakeEnabled,
      callSimulation: callSimulationEnabled,
      webhookSimulation: webhookSimulationEnabled,
      recordingUrlStorage: storeRecordingUrls,
      providerRecordingUrls: providerRecordingUrlsEnabled,
    },
    storeRecordingUrls,
    providerRecordingUrlsEnabled,
  };
}

function validateRequiredSecrets(options) {
  const isProduction = options.nodeEnv === 'production';

  if (options.strict && isProduction && !options.databaseUrl) {
    options.errors.push('DATABASE_URL is required when NODE_ENV=production.');
  }

  if (options.staffAuthMode === 'jwt' && !optionalTrim(process.env.JWT_SECRET)) {
    options.errors.push('JWT_SECRET is required when STAFF_AUTH_MODE=jwt.');
  }

  if (options.strict && isProduction && options.staffAuthMode === 'legacy' && !optionalTrim(process.env.STAFF_ACCESS_TOKEN)) {
    options.errors.push('STAFF_ACCESS_TOKEN is required for legacy staff auth when NODE_ENV=production.');
  }

  if (isProduction && options.telephonyProvider !== 'mock') {
    if (!optionalTrim(process.env.TELEPHONY_FROM_NUMBER)) {
      options.errors.push('TELEPHONY_FROM_NUMBER is required when TELEPHONY_PROVIDER is not mock.');
    }
    if (!optionalTrim(process.env.WEBHOOK_SIGNING_SECRET)) {
      options.errors.push('WEBHOOK_SIGNING_SECRET is required when TELEPHONY_PROVIDER is not mock.');
    }
  }

  if (options.telephonyProvider === 'twilio') {
    requireOneOf(['TELEPHONY_ACCOUNT_SID', 'TELEPHONY_API_KEY'], options.errors);
    requireEnv('TELEPHONY_AUTH_TOKEN', options.errors);
  }

  if (options.telephonyProvider === 'telnyx') {
    requireEnv('TELEPHONY_API_KEY', options.errors);
  }

  if (options.aiProvider !== 'mock') {
    requireEnv('AI_PROVIDER_API_KEY', options.errors);
  }

  for (const [name, value] of [
    ['WEBHOOK_TUNNEL_URL', process.env.WEBHOOK_TUNNEL_URL],
  ]) {
    readOptionalUrl(name, value, options.errors);
  }
}

function requireEnv(name, errors) {
  if (!optionalTrim(process.env[name])) {
    errors.push(`${name} is required.`);
  }
}

function requireOneOf(names, errors) {
  if (!names.some((name) => optionalTrim(process.env[name]))) {
    errors.push(`One of ${names.join(', ')} is required.`);
  }
}

function optionalTrim(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readBoolean(name, value, errors) {
  if (/^(true|1|yes)$/i.test(value)) {
    return true;
  }
  if (/^(false|0|no)$/i.test(value)) {
    return false;
  }
  errors.push(`${name} must be true or false when provided.`);
  return false;
}

function readPositiveInteger(name, value, errors) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push(`${name} must be a positive integer when provided.`);
    return null;
  }
  return parsed;
}

function readEnum(name, value, allowedValues, errors) {
  if (!allowedValues.has(value)) {
    errors.push(`${name} must be one of: ${Array.from(allowedValues).join(', ')}.`);
    return Array.from(allowedValues)[0];
  }
  return value;
}

function readUrl(name, value, errors) {
  if (!value) {
    errors.push(`${name} is required.`);
    return '';
  }
  return readOptionalUrl(name, value, errors) || '';
}

function readOptionalUrl(name, value, errors) {
  const normalized = optionalTrim(value);
  if (!normalized) {
    return undefined;
  }

  try {
    // eslint-disable-next-line no-new
    new URL(normalized);
    return normalized;
  } catch (_error) {
    errors.push(`${name} must be a valid URL when provided.`);
    return undefined;
  }
}

function resetConfigForTests() {
  loaded = false;
}

module.exports = {
  getConfig,
  resetConfigForTests,
};
