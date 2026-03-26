const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createHealthRoutes(config) {
  const router = createRouter();

  router.get('/health', (_request, response) => {
    json(response, 200, {
      status: 'ok',
      service: config.appName,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  return router.all();
}

module.exports = {
  createHealthRoutes,
};
