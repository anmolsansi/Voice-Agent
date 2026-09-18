const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');
const { readJsonBody } = require('../../http/request');
const { json } = require('../../http/response');
const { objectInput, fail } = require('../../http/errors');
const { createRouter } = require('../../http/router');
const { getCallDetail: getPersistedCallDetail, persistCallDetail } = require('./call-service');
const { createCallAttempt, finalizeCall, getCallDetail, listCalls, updateCallStatus } = require('./service');
function createCallRoutes() {
  const router = createRouter();
  router.get('/api/calls', async (_req, res, ctx) => {
    const filters = Object.fromEntries(ctx.url.searchParams);
    const items = await listCalls(filters);
    json(res, 200, { items, total: items.length });
  });
  router.post('/api/calls', async (req, res, ctx) => {
    const result = await createCallAttempt(await readJsonBody(req), { actor: ctx.actor });
    json(res, result.created ? 201 : 200, result);
  }, 'admin');
  router.get('/api/calls/:callId', async (_req, res, ctx) => json(res, 200, await getCallDetail(ctx.params.callId)));
  router.post('/api/calls/:callId/status', async (req, res, ctx) => json(res, 200, { call: await updateCallStatus(ctx.params.callId, await readJsonBody(req), { actor: ctx.actor }) }), 'admin');
  router.post('/api/calls/:callId/finalize', async (req, res, ctx) => json(res, 200, { call: await finalizeCall(ctx.params.callId, await readJsonBody(req), { actor: ctx.actor }) }), 'admin');
  router.put('/api/calls/:callId/detail', async (req, res, ctx) => json(res, 200, { callDetail: await persistCallDetail(ctx.params.callId, await readJsonBody(req), { actor: ctx.actor }) }), 'admin');
  router.get('/api/calls/:publicCallId/detail', async (_req, res, ctx) => json(res, 200, { callDetail: await getPersistedCallDetail(ctx.params.publicCallId) }));
  router.post('/api/jobs/checkins/enqueue', async (req, res) => {
    objectInput(await readJsonBody(req), []);
    if (process.env.FEATURE_CALL_SIMULATION === 'false') throw fail(409, 'SIMULATION_DISABLED', 'Call simulation is disabled.');
    json(res, 200, await enqueueEligibleCheckInCalls());
  }, 'scheduler');
  return router.all();
}
module.exports = { createCallRoutes };
