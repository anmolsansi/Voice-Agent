const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createStaffRoutes() {
  const router = createRouter();

  router.get('/api/staff/intakes', (_request, response) => {
    json(response, 501, {
      error: 'Not implemented',
      module: 'staff',
      message: 'Staff-facing intake endpoints will be added in a follow-up task.',
    });
  });

  return router.all();
}

module.exports = {
  createStaffRoutes,
};
