const { Pool } = require('pg');
const { getConfig } = require('../../config/env');

let pool = null;
let warnedDisabled = false;
let warnedUnavailable = false;

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

function getPool() {
  if (pool) {
    return pool;
  }

  const poolConfig = getPoolConfig();
  if (!poolConfig) {
    return null;
  }

  pool = new Pool(poolConfig);
  pool.on('error', () => {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn('Postgres pool error; intake persistence will use the in-memory fallback until connectivity is restored.');
    }
  });

  return pool;
}

function isDatabaseConfigured() {
  return Boolean(getPoolConfig());
}

async function query(text, params) {
  const activePool = getPool();
  if (!activePool) {
    if (!warnedDisabled) {
      warnedDisabled = true;
      console.warn('DATABASE_URL is not configured; intake persistence is running with the in-memory fallback.');
    }
    const error = new Error('DATABASE_UNAVAILABLE');
    error.code = 'DATABASE_UNAVAILABLE';
    throw error;
  }

  try {
    return await activePool.query(text, params);
  } catch (error) {
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

module.exports = {
  closePool,
  getPool,
  isDatabaseConfigured,
  query,
};
