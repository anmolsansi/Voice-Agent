const { readJsonBody } = require('../../http/request');
const { createRouter } = require('../../http/router');
const { json, send } = require('../../http/response');
const { generateIntakeSessionPdf } = require('./pdf-summary');
const {
  createIntakeSession,
  getIntakeSessionByPublicSessionId,
  intakeSessionStore,
  loadIntakeSessionByPublicSessionId,
  reviewIntakeSessionByPublicSessionId,
  saveFieldValue,
  serializeSession,
  submitIntakeSession,
} = require('./session-service');

function createIntakeRoutes() {
  const router = createRouter();

  router.get('/api/intake/sessions', async (_request, response) => {
    const items = (await intakeSessionStore.list()).map(serializeSession);

    json(response, 200, {
      items,
      total: items.length,
    });
  });

  router.get('/api/intake/sessions/resume', async (request, response, context) => {
    try {
      const publicSessionId = context.url.searchParams.get('publicSessionId');
      const session = await loadIntakeSessionByPublicSessionId(publicSessionId);

      return json(response, 200, { session });
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_PUBLIC_SESSION_ID'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 500
              ? 'Internal server error'
              : 'Invalid request',
        message: statusCode === 500 ? 'Unable to load intake session.' : error.message,
      });
    }
  });

  router.post('/api/intake/sessions', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const session = await createIntakeSession(payload);

      return json(response, 201, { session });
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_SOURCE_MODE' || error.message === 'Request body must be valid JSON.'
          ? 400
          : 500;

      return json(response, statusCode, {
        error: statusCode === 500 ? 'Internal server error' : 'Invalid request',
        message: statusCode === 500 ? 'Unable to create intake session.' : error.message,
      });
    }
  });

  router.post('/api/intake/sessions/submit', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await submitIntakeSession(payload);

      return json(response, 200, result);
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_SESSION_ID' || error.message === 'Request body must be valid JSON.'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : error.code === 'SUBMISSION_BLOCKED'
              ? 409
              : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 409
              ? 'Submission blocked'
              : statusCode === 500
                ? 'Internal server error'
                : 'Invalid request',
        message:
          statusCode === 500
            ? 'Unable to submit intake session.'
            : error.message,
        validation: error.details || null,
      });
    }
  });

  router.post('/api/staff/sessions/:publicSessionId/review', async (request, response, context) => {
    try {
      const payload = await readJsonBody(request).catch((error) => {
        if (error.message === 'Request body must be valid JSON.') {
          throw error;
        }

        return {};
      });
      const session = await reviewIntakeSessionByPublicSessionId({
        publicSessionId: context.params.publicSessionId,
        notes: payload.notes,
      });

      return json(response, 200, { session });
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_PUBLIC_SESSION_ID' || error.message === 'Request body must be valid JSON.'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : error.code === 'INVALID_SESSION_STATUS'
              ? 409
              : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 409
              ? 'Review blocked'
              : statusCode === 500
                ? 'Internal server error'
                : 'Invalid request',
        message: statusCode === 500 ? 'Unable to mark intake session reviewed.' : error.message,
      });
    }
  });

  router.get('/api/intake/sessions/:publicSessionId/pdf', async (_request, response, context) => {
    try {
      const session = await getIntakeSessionByPublicSessionId(context.params.publicSessionId);

      if (session.status !== 'submitted' || !session.submittedAt) {
        return json(response, 409, {
          error: 'Session not submitted',
          message: 'PDF summary is only available after the intake session has been submitted.',
        });
      }

      const pdfBuffer = await generateIntakeSessionPdf(session);

      return send(response, 200, pdfBuffer, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${session.publicSessionId}-summary.pdf"`,
      });
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_PUBLIC_SESSION_ID'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 500
              ? 'Internal server error'
              : 'Invalid request',
        message: statusCode === 500 ? 'Unable to generate intake PDF summary.' : error.message,
      });
    }
  });

  router.post('/api/intake/fields', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await saveFieldValue(payload);

      return json(response, 200, result);
    } catch (error) {
      const statusCode =
        error.code === 'INVALID_SESSION_ID' ||
        error.code === 'INVALID_FIELD_KEY' ||
        error.code === 'INVALID_SOURCE' ||
        error.message === 'Request body must be valid JSON.'
          ? 400
          : error.code === 'SESSION_NOT_FOUND'
            ? 404
            : 500;

      return json(response, statusCode, {
        error:
          statusCode === 404
            ? 'Not found'
            : statusCode === 500
              ? 'Internal server error'
              : 'Invalid request',
        message: statusCode === 500 ? 'Unable to save intake field.' : error.message,
      });
    }
  });

  return router.all();
}

module.exports = {
  createIntakeRoutes,
};
