const { getPersistenceStatus } = require('../../lib/db/postgres');
const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createHealthRoutes(config) {
  const router = createRouter();

  router.get('/health', async (_request, response) => {
    const persistence = await getPersistenceStatus();

    json(response, persistence.ready ? 200 : 503, {
      status: persistence.ready ? 'ok' : 'error',
      service: config.appName,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      persistence,
    });
  });

  router.get('/ready', async (_request, response) => {
    const persistence = await getPersistenceStatus();

    json(response, persistence.ready ? 200 : 503, {
      ready: persistence.ready,
      service: config.appName,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      persistence,
    });
  });

  return router.all();
}

module.exports = {
  createHealthRoutes,
};
