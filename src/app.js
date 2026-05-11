const { notFound } = require('./http/response');
const { createHealthRoutes } = require('./modules/health/routes');
const { createIntakeRoutes } = require('./modules/intake/routes');
const { createSubmissionRoutes } = require('./modules/submission/routes');
const { createAuditRoutes } = require('./modules/audit/routes');
const { createCallRoutes } = require('./modules/calls/routes');
const { createStaffRoutes } = require('./modules/staff/routes');
const { createCallRoutes } = require('./modules/calls/routes');

function createApp(config) {
  const routes = [
    ...createHealthRoutes(config),
    ...createIntakeRoutes(config),
    ...createSubmissionRoutes(config),
    ...createCallRoutes(config),
    ...createAuditRoutes(config),
    ...createStaffRoutes(config),
    ...createCallRoutes(config),
  ];

  return function app(request, response) {
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
    return routeMatch.handler(request, response, { config, url, params });
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
