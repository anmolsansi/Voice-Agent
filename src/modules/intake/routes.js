const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createIntakeRoutes() {
  const router = createRouter();

  router.get('/api/intake/sessions', (_request, response) => {
    json(response, 501, {
      error: 'Not implemented',
      module: 'intake',
      message: 'Intake session endpoints will be added in a follow-up task.',
    });
  });

  return router.all();
}

module.exports = {
  createIntakeRoutes,
};
