const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createAuditRoutes() {
  const router = createRouter();

  router.get('/api/audit/logs', (_request, response) => {
    json(response, 501, {
      error: 'Not implemented',
      module: 'audit',
      message: 'Audit log endpoints will be added in a follow-up task.',
    });
  });

  return router.all();
}

module.exports = {
  createAuditRoutes,
};
