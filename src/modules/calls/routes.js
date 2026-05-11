const { readJsonBody } = require('../../http/request');
const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');
const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');
const {
  createCallAttempt,
  finalizeCall,
  getCallDetail,
  getHttpStatus,
  listCalls,
  seedSchedule,
  serializeError,
  updateCallStatus,
} = require('./service');

function createCallRoutes() {
  const router = createRouter();

  router.post('/api/calls', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await createCallAttempt(payload, {
        idempotencyKey: request.headers['idempotency-key'],
        actor: getActor(request),
      });
      return json(response, result.created ? 201 : 200, result);
    } catch (error) {
      return writeError(response, error, 'Unable to create call attempt.');
    }
  });

  router.get('/api/calls', async (_request, response, context) => {
    try {
      const calls = await listCalls({
        patientId: context.url.searchParams.get('patientId'),
        scheduleId: context.url.searchParams.get('scheduleId'),
        status: context.url.searchParams.get('status'),
      });
      return json(response, 200, { items: calls, total: calls.length });
    } catch (error) {
      return writeError(response, error, 'Unable to list calls.');
    }
  });

  router.get('/api/calls/:callId', async (_request, response, context) => {
    try {
      const detail = await getCallDetail(context.params.callId);
      return json(response, 200, detail);
    } catch (error) {
      return writeError(response, error, 'Unable to load call detail.');
    }
  });

  router.post('/api/calls/:callId/status', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await updateCallStatus(context.params.callId, payload, { actor: getActor(request) });
      return json(response, 200, { call });
    } catch (error) {
      return writeError(response, error, 'Unable to update call status.');
    }
  });

  router.post('/api/calls/:callId/finalize', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request);
      const call = await finalizeCall(context.params.callId, payload, { actor: getActor(request) });
      return json(response, 200, { call });
    } catch (error) {
      return writeError(response, error, 'Unable to finalize call.');
    }
  });

  router.post('/api/jobs/checkins/enqueue', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const seededSchedules = Array.isArray(payload.schedules)
        ? await Promise.all(payload.schedules.map((schedule) => seedSchedule(schedule)))
        : null;
      const result = await enqueueEligibleCheckInCalls({
        now: payload.now,
        schedules: seededSchedules || undefined,
      });
      return json(response, 200, result);
    } catch (error) {
      return writeError(response, error, 'Unable to enqueue check-in calls.');
    }
  });

  return router.all();
}

function getActor(request) {
  return {
    type: request.headers['x-actor-type'] || 'api',
    id: request.headers['x-actor-id'] || null,
  };
}

function writeError(response, error, fallbackMessage) {
  return json(response, getHttpStatus(error), serializeError(error, fallbackMessage));
}

module.exports = {
  createCallRoutes,
};
