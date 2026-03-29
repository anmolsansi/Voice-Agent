const { readJsonBody } = require('../../http/request');
const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');
const { createIntakeSession, intakeSessionStore } = require('./session-service');

function createIntakeRoutes() {
  const router = createRouter();

  router.get('/api/intake/sessions', (_request, response) => {
    json(response, 200, {
      items: intakeSessionStore.list(),
      total: intakeSessionStore.list().length,
    });
  });

  router.post('/api/intake/sessions', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const session = createIntakeSession(payload);

      return json(response, 201, { session });
    } catch (error) {
      const statusCode = error.code === 'INVALID_SOURCE_MODE' || error.message === 'Request body must be valid JSON.' ? 400 : 500;

      return json(response, statusCode, {
        error: statusCode === 500 ? 'Internal server error' : 'Invalid request',
        message: statusCode === 500 ? 'Unable to create intake session.' : error.message,
      });
    }
  });

  return router.all();
}

module.exports = {
  createIntakeRoutes,
};
