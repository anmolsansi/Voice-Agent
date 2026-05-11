const { readJsonBody } = require('../../http/request');
const { json } = require('../../http/response');
const { createRouter } = require('../../http/router');
const { getCallDetail, persistCallDetail } = require('./call-service');

function createCallRoutes() {
  const router = createRouter();

  router.post('/api/calls', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const callDetail = await persistCallDetail(payload);

      return json(response, 201, { callDetail });
    } catch (error) {
      return json(response, getStatusCode(error), {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to persist call detail.'),
      });
    }
  });

  router.get('/api/calls/:publicCallId/detail', async (_request, response, context) => {
    try {
      const callDetail = await getCallDetail(context.params.publicCallId);

      return json(response, 200, { callDetail });
    } catch (error) {
      return json(response, getStatusCode(error), {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to load call detail.'),
      });
    }
  });

  return router.all();
}

function getStatusCode(error) {
  if (error.code === 'INVALID_CALL_DETAIL' || error.code === 'INVALID_PUBLIC_CALL_ID') {
    return 400;
  }

  if (error.code === 'CALL_NOT_FOUND') {
    return 404;
  }

  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return 503;
  }

  return 500;
}

function getErrorLabel(error) {
  if (error.code === 'CALL_NOT_FOUND') {
    return 'Call not found';
  }

  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return 'Service unavailable';
  }

  if (error.code === 'INVALID_CALL_DETAIL' || error.code === 'INVALID_PUBLIC_CALL_ID') {
    return 'Invalid request';
  }

  return 'Internal server error';
}

function getClientMessage(error, fallback) {
  if (
    error.code === 'INVALID_CALL_DETAIL' ||
    error.code === 'INVALID_PUBLIC_CALL_ID' ||
    error.code === 'CALL_NOT_FOUND' ||
    error.code === 'PERSISTENCE_UNAVAILABLE'
  ) {
    return error.message;
  }

  return fallback;
}

module.exports = {
  createCallRoutes,
};
