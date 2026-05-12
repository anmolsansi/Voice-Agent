const { readJsonBody } = require('../../http/request');
const { json } = require('../../http/response');
const { createRouter } = require('../../http/router');
const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');
const { getCallDetail: getPersistedCallDetail, persistCallDetail } = require('./call-service');
const {
  createCallAttempt,
  finalizeCall,
  getCallDetail,
  getHttpStatus,
  listCalls,
  serializeError,
  updateCallStatus,
} = require('./service');

function createCallRoutes() {
  const router = createRouter();

  router.post('/api/calls', async (request, response) => {
    try {
      const payload = await readJsonBody(request);

      if (isCallAttemptPayload(payload)) {
        const result = await createCallAttempt(payload, { actor: { type: 'api', id: 'calls.create' } });
        return json(response, result.created ? 201 : 200, result);
      }

      const callDetail = await persistCallDetail(payload);
      return json(response, 201, { callDetail });
    } catch (error) {
      return writeCallError(response, error, 'Unable to persist call detail.');
    }
  });

  router.get('/api/calls', async (_request, response, context) => {
    try {
      const filters = {
        patientId: context.url.searchParams.get('patientId'),
        scheduleId: context.url.searchParams.get('scheduleId'),
        status: context.url.searchParams.get('status'),
      };
      const items = await listCalls(filters);
      return json(response, 200, { items, total: items.length });
    } catch (error) {
      return writeCallError(response, error, 'Unable to list calls.');
    }
  });

  router.get('/api/calls/:callId', async (_request, response, context) => {
    try {
      const detail = await getCallDetail(context.params.callId);
      return json(response, 200, detail);
    } catch (error) {
      return writeCallError(response, error, 'Unable to load call.');
    }
  });

  router.post('/api/calls/:callId/status', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await updateCallStatus(context.params.callId, payload, { actor: { type: 'api', id: 'calls.status' } });
      return json(response, 200, { call });
    } catch (error) {
      return writeCallError(response, error, 'Unable to update call status.');
    }
  });

  router.post('/api/calls/:callId/finalize', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await finalizeCall(context.params.callId, payload, { actor: { type: 'api', id: 'calls.finalize' } });
      return json(response, 200, { call });
    } catch (error) {
      return writeCallError(response, error, 'Unable to finalize call.');
    }
  });

  router.get('/api/calls/:publicCallId/detail', async (_request, response, context) => {
    try {
      const callDetail = await getPersistedCallDetail(context.params.publicCallId);
      return json(response, 200, { callDetail });
    } catch (error) {
      return writeCallError(response, error, 'Unable to load call detail.');
    }
  });

  router.post('/api/jobs/checkins/enqueue', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await enqueueEligibleCheckInCalls(payload);
      return json(response, 200, result);
    } catch (error) {
      return writeCallError(response, error, 'Unable to enqueue check-in calls.');
    }
  });

  return router.all();
}

function isCallAttemptPayload(payload = {}) {
  return Boolean(payload.patientId || payload.scheduleId || payload.idempotencyKey || payload.attemptNumber);
}

function writeCallError(response, error, fallbackMessage) {
  if (error.code === 'INVALID_CALL_DETAIL' || error.code === 'INVALID_PUBLIC_CALL_ID') {
    return json(response, 400, {
      error: 'Invalid request',
      message: error.message,
    });
  }

  if (error.code === 'CALL_NOT_FOUND') {
    return json(response, 404, {
      error: 'Call not found',
      message: error.message,
    });
  }

  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return json(response, 503, {
      error: 'Service unavailable',
      message: error.message,
    });
  }

  return json(response, getHttpStatus(error), serializeError(error, fallbackMessage));
}

module.exports = {
  createCallRoutes,
};
