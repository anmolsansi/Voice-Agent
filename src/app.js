const { randomUUID, timingSafeEqual } = require('node:crypto');
const { json } = require('./http/response');
const { fail } = require('./http/errors');
const auth = require('./modules/auth/service');
const { createAuthRoutes } = require('./modules/auth/routes');
const { notFound } = require('./http/response');
const { createHealthRoutes } = require('./modules/health/routes');
const { createIntakeRoutes } = require('./modules/intake/routes');
const { createSubmissionRoutes } = require('./modules/submission/routes');
const { createAuditRoutes } = require('./modules/audit/routes');
const { createCallRoutes } = require('./modules/calls/routes');
const { createStaffRoutes } = require('./modules/staff/routes');

function createApp(config) {
  const routes = [
    ...createAuthRoutes(),
    ...createHealthRoutes(config),
    ...createIntakeRoutes(config),
    ...createSubmissionRoutes(config),
    ...createCallRoutes(config),
    ...createAuditRoutes(config),
    ...createStaffRoutes(config),
  ];

  const identities = routes.map((r) => `${r.method} ${r.path}`);
  if (new Set(identities).size !== identities.length) throw new Error('Duplicate route registration.');
  return async function app(request, response) {
    const requestId = randomUUID();
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('Cache-Control', 'no-store');
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const routeMatch = routes.find((candidate) => {
        if (candidate.method !== request.method) {
          return false;
        }

        return matchPath(candidate.path, url.pathname) !== null;
      });

      if (!routeMatch) {
        return notFound(response, {
          error: 'Route not found',
          method: request.method,
          path: url.pathname,
        });
      }

      const params = matchPath(routeMatch.path, url.pathname) || {};
      const token = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.authorization || '')?.[1];
      const context = { config, url, params, token, requestId };
      if (routeMatch.access === 'scheduler') {
        const expected = process.env.SCHEDULER_TOKEN || '';
        const supplied = request.headers.authorization?.replace(/^Bearer /, '') || '';
        if (expected.length < 32 || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw fail(401, 'UNAUTHORIZED', 'Scheduler authentication required.');
        context.actor = { type: 'worker', id: 'checkins.enqueue' };
      } else if (routeMatch.access !== 'public') {
        context.user = await auth.authenticate(token, { allowPasswordChange: routeMatch.access === 'password' });
        if (routeMatch.access === 'admin' && context.user.role !== 'admin') throw fail(403, 'FORBIDDEN', 'Administrator access required.');
        context.actor = { type: 'staff', id: context.user.id };
        request.auth = context.user;
      }
      return await routeMatch.handler(request, response, context);
    } catch (error) {
      const status = error.status || (error instanceof URIError ? 400 : error.code === 'PERSISTENCE_UNAVAILABLE' || /^(ECONN|EHOST|ETIMEDOUT|ENOTFOUND)/.test(error.code || '') ? 503 : 500);
      const code = status === 500 ? 'INTERNAL_ERROR' : status === 503 ? 'SERVICE_UNAVAILABLE' : error.code || 'INVALID_REQUEST';
      if (status === 429) response.setHeader('Retry-After', '900');
      if (status >= 500) console.error(JSON.stringify({ level: 'error', requestId, code }));
      if (!response.headersSent) json(response, status, { error: { code, message: status >= 500 ? 'Service unavailable. Try again.' : error.message }, requestId });
    }
  };
}

function matchPath(routePath, requestPath) {
  if (routePath === requestPath) {
    return {};
  }

  const routeSegments = routePath.split('/').filter(Boolean);
  const requestSegments = requestPath.split('/').filter(Boolean);

  if (routeSegments.length !== requestSegments.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const requestSegment = requestSegments[index];

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(requestSegment);
      continue;
    }

    if (routeSegment !== requestSegment) {
      return null;
    }
  }

  return params;
}

module.exports = {
  createApp,
};
