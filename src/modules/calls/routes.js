const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');
const { readJsonBody } = require('../../http/request');
const { json } = require('../../http/response');
const { createRouter } = require('../../http/router');
const { getCallDetail, persistCallDetail } = require('./call-service');
const {
  createCallAttempt,
  finalizeCall,
  getHttpStatus,
  listCalls,
  serializeError,
  updateCallStatus,
} = require('./service');

function createCallRoutes() {
  const router = createRouter();

  router.get('/api/calls', async (_request, response, context) => {
    try {
      const filters = {
        patientId: context.url.searchParams.get('patientId') || undefined,
        scheduleId: context.url.searchParams.get('scheduleId') || undefined,
        status: context.url.searchParams.get('status') || undefined,
      };
      const items = await listCalls(filters);
      return json(response, 200, { items, total: items.length });
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to list calls.'));
    }
  });

  router.post('/api/calls', async (request, response) => {
    try {
      const payload = await readJsonBody(request);

      if (isCallDetailPayload(payload)) {
        const callDetail = await persistCallDetail(payload);
        return json(response, 201, { callDetail });
      }

      const result = await createCallAttempt(payload);
      return json(response, result.created ? 201 : 200, result);
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to create call.'));
    }
  });

  router.get('/api/calls/:callId', async (_request, response, context) => {
    try {
      const call = await require('./service').getCallDetail(context.params.callId);
      return json(response, 200, call);
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to load call.'));
    }
  });

  router.post('/api/calls/:callId/status', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await updateCallStatus(context.params.callId, payload);
      return json(response, 200, { call });
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to update call status.'));
    }
  });

  router.post('/api/calls/:callId/finalize', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await finalizeCall(context.params.callId, payload);
      return json(response, 200, { call });
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to finalize call.'));
    }
  });

  router.get('/api/calls/:publicCallId/detail', async (_request, response, context) => {
    try {
      const callDetail = await getCallDetail(context.params.publicCallId);

      return json(response, 200, { callDetail });
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to load call detail.'));
    }
  });

  router.post('/api/jobs/checkins/enqueue', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await enqueueEligibleCheckInCalls(payload);
      return json(response, 200, result);
    } catch (error) {
      return json(response, getCallStatusCode(error), serializeCallError(error, 'Unable to enqueue check-in calls.'));
    }
  });

  return router.all();
}

function isCallDetailPayload(payload) {
  return Boolean(
    payload?.publicCallId ||
    payload?.call?.publicCallId ||
    Array.isArray(payload?.events) ||
    Array.isArray(payload?.transcriptTurns) ||
    Array.isArray(payload?.auditLogs) ||
    payload?.recording ||
    payload?.recordings,
  );
}

function getCallStatusCode(error) {
  if (error.code === 'INVALID_CALL_DETAIL' || error.code === 'INVALID_PUBLIC_CALL_ID') {
    return 400;
  }

  if (error.code === 'CALL_NOT_FOUND') {
    return 404;
  }

  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return 503;
  }

  return getHttpStatus(error);
}

function serializeCallError(error, fallbackMessage) {
  if (
    error.code === 'INVALID_CALL_DETAIL' ||
    error.code === 'INVALID_PUBLIC_CALL_ID' ||
    error.code === 'CALL_NOT_FOUND' ||
    error.code === 'PERSISTENCE_UNAVAILABLE'
  ) {
    return {
      error: getErrorLabel(error),
      message: error.message,
    };
  }

  return serializeError(error, fallbackMessage);
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

module.exports = {
  createCallRoutes,
};
