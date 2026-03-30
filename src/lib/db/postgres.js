const { Pool } = require('pg');
const { getConfig } = require('../../config/env');

let pool = null;
let warnedUnavailable = false;
let lastPoolError = null;

function getPoolConfig() {
  const config = getConfig();

  if (!config.databaseUrl) {
    return null;
  }

  return config.pgSsl
    ? {
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false },
      }
    : {
        connectionString: config.databaseUrl,
      };
}

function isMemoryFallbackAllowed() {
  const config = getConfig();
  return config.nodeEnv === 'development' || config.allowMemoryFallback;
}

function createPersistenceError(message, reason) {
  const error = new Error(message);
  error.code = 'PERSISTENCE_UNAVAILABLE';
  error.reason = reason;
  return error;
}

function getPool() {
  if (pool) {
    return pool;
  }

  const poolConfig = getPoolConfig();
  if (!poolConfig) {
    return null;
  }

  pool = new Pool(poolConfig);
  pool.on('error', (error) => {
    lastPoolError = error;

    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn('Postgres pool error; persistence may be unavailable until database connectivity is restored.');
    }
  });

  return pool;
}

function isDatabaseConfigured() {
  return Boolean(getPoolConfig());
}

async function getPersistenceStatus() {
  const databaseConfigured = isDatabaseConfigured();
  const memoryFallbackAllowed = isMemoryFallbackAllowed();

  if (!databaseConfigured) {
    return memoryFallbackAllowed
      ? {
          ready: true,
          mode: 'memory-fallback',
          reason: 'DATABASE_URL is not configured; in-memory fallback is enabled for local development.',
        }
      : {
          ready: false,
          mode: 'database-required',
          reason: 'DATABASE_URL is not configured and in-memory fallback is disabled.',
        };
  }

  try {
    await query('select 1');
    return {
      ready: true,
      mode: 'database',
      reason: null,
    };
  } catch (error) {
    if (memoryFallbackAllowed) {
      return {
        ready: true,
        mode: 'memory-fallback',
        reason: 'Database connectivity check failed; in-memory fallback is enabled for local development.',
      };
    }

    return {
      ready: false,
      mode: 'database-required',
      reason: 'Database connectivity check failed and in-memory fallback is disabled.',
      errorCode: error.code || 'DATABASE_UNAVAILABLE',
    };
  }
}

async function query(text, params) {
  const activePool = getPool();
  if (!activePool) {
    throw createPersistenceError(
      isMemoryFallbackAllowed()
        ? 'Database is unavailable; persistence is operating in explicit in-memory fallback mode.'
        : 'Database is required for persistence in this environment.',
      'DATABASE_URL_MISSING',
    );
  }

  try {
    return await activePool.query(text, params);
  } catch (error) {
    lastPoolError = error;
    error.code = error.code || 'DATABASE_UNAVAILABLE';
    throw error;
  }
}

async function closePool() {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;
  await activePool.end();
}

function getLastPoolErrorCode() {
  return lastPoolError?.code || null;
}

module.exports = {
  closePool,
  createPersistenceError,
  getLastPoolErrorCode,
  getPersistenceStatus,
  getPool,
  isDatabaseConfigured,
  isMemoryFallbackAllowed,
  query,
};
