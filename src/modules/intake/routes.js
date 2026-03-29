const { readJsonBody } = require('../../http/request');
const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');
const {
  createIntakeSession,
  intakeSessionStore,
  saveFieldValue,
  serializeSession,
} = require('./session-service');

function createIntakeRoutes() {
  const router = createRouter();

  router.get('/api/intake/sessions', (_request, response) => {
    const items = intakeSessionStore.list().map(serializeSession);

    json(response, 200, {
      items,
      total: items.length,
    });
  });

  router.post('/api/intake/sessions', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const session = createIntakeSession(payload);

      return json(response, 201, { session });
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_SOURCE_MODE' || error.message === 'Request body must be valid JSON.'
          ? 400
          : 500;

      return json(response, statusCode, {
        error: statusCode === 500 ? 'Internal server error' : 'Invalid request',
        message: statusCode === 500 ? 'Unable to create intake session.' : error.message,
      });
    }
  });

  router.post('/api/intake/fields', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = saveFieldValue(payload);

      return json(response, 200, result);
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_SESSION_ID' ||
        error.code === 'INVALID_FIELD_KEY' ||
        error.code === 'INVALID_SOURCE' ||
        error.message === 'Request body must be valid JSON.'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 500
              ? 'Internal server error'
              : 'Invalid request',
        message: statusCode === 500 ? 'Unable to save intake field.' : error.message,
      });
    }
  });

  return router.all();
}

module.exports = {
  createIntakeRoutes,
};
