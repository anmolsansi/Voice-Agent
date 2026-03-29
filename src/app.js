const { notFound } = require('./http/response');
const { createHealthRoutes } = require('./modules/health/routes');
const { createIntakeRoutes } = require('./modules/intake/routes');
const { createSubmissionRoutes } = require('./modules/submission/routes');
const { createAuditRoutes } = require('./modules/audit/routes');
const { createStaffRoutes } = require('./modules/staff/routes');

function createApp(config) {
  const routes = [
    ...createHealthRoutes(config),
    ...createIntakeRoutes(config),
    ...createSubmissionRoutes(config),
    ...createAuditRoutes(config),
    ...createStaffRoutes(config),
  ];

  return function app(request, response) {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const route = routes.find(
      (candidate) => candidate.method === request.method && candidate.path === url.pathname,
    );

    if (!route) {
      return notFound(response, {
        error: 'Route not found',
        method: request.method,
        path: url.pathname,
      });
    }

    return route.handler(request, response, { config, url });
  };
}

module.exports = {
  createApp,
};
