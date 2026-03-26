const { createRouter } = require('../../http/router');
const { json } = require('../../http/response');

function createSubmissionRoutes() {
  const router = createRouter();

  router.post('/api/submissions', (_request, response) => {
    json(response, 501, {
      error: 'Not implemented',
      module: 'submission',
      message: 'Submission endpoints will be added in a follow-up task.',
    });
  });

  return router.all();
}

module.exports = {
  createSubmissionRoutes,
};
