const { createRouter } = require('../../http/router');
const { readJsonBody } = require('../../http/request');
const { json } = require('../../http/response');
const service = require('./service');
function createAuthRoutes() {
  const router = createRouter();
  router.post('/api/auth/login', async (req, res) => json(res, 200, await service.login(await readJsonBody(req), req.socket.remoteAddress)), 'public');
  router.get('/api/auth/me', async (_req, res, ctx) => json(res, 200, { user: ctx.user }), 'password');
  router.post('/api/auth/logout', async (_req, res, ctx) => { await service.logout(ctx.token); json(res, 200, { ok: true }); }, 'password');
  router.post('/api/auth/password', async (req, res, ctx) => json(res, 200, await service.changePassword(ctx.token, await readJsonBody(req))), 'password');
  router.get('/api/staff/users', async (_req, res, ctx) => json(res, 200, await service.listUsers(ctx.user)), 'admin');
  router.post('/api/staff/users', async (req, res, ctx) => json(res, 201, { user: await service.createUser(await readJsonBody(req), ctx.user) }), 'admin');
  router.patch('/api/staff/users/:userId', async (req, res, ctx) => json(res, 200, { user: await service.updateUser(ctx.params.userId, await readJsonBody(req), ctx.user) }), 'admin');
  return router.all();
}
module.exports = { createAuthRoutes };
