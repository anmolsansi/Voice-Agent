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

const STAFF_ACCESS_HEADER = 'x-staff-access-token';

function getConfiguredStaffAccessToken() {
  return (process.env.STAFF_ACCESS_TOKEN || '').trim();
}

function hasValidStaffAccess(request) {
  const configuredToken = getConfiguredStaffAccessToken();
  if (!configuredToken) {
    return false;
  }

  const providedToken = request.headers[STAFF_ACCESS_HEADER] || request.headers[STAFF_ACCESS_HEADER.toLowerCase()];
  return providedToken === configuredToken;
}

function requireStaffAccess(request, response) {
  if (hasValidStaffAccess(request)) {
    return true;
  }

  json(response, 401, {
    error: 'Unauthorized',
    message: 'Staff authentication required.',
  });

  return false;
}

function createIntakeRoutes() {
  const router = createRouter();

  router.get('/api/intake/sessions', async (request, response) => {
    try {
      const hasAccess = requireStaffAccess(request, response);
      if (!hasAccess) {
        return;
      }

      const items = (await intakeSessionStore.list()).map(serializeSession);

      json(response, 200, {
        items,
        total: items.length,
      });
    } catch (error) {
      json(response, getStatusCode(error), {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to load intake sessions.'),
      });
    }
  });

  router.get('/api/intake/sessions/resume', async (request, response, context) => {
    try {
      const publicSessionId = context.url.searchParams.get('publicSessionId');
      const session = await loadIntakeSessionByPublicSessionId(publicSessionId);

      return json(response, 200, { session });
    } catch (error) {
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to load intake session.'),
      });
    }
  });

  router.post('/api/intake/sessions', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const session = await createIntakeSession(payload);

      return json(response, 201, { session });
    } catch (error) {
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to create intake session.'),
      });
    }
  });

  router.post('/api/intake/sessions/submit', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await submitIntakeSession(payload);

      return json(response, 200, result);
    } catch (error) {
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to submit intake session.'),
        validation: error.details || null,
      });
    }
  });

  router.get('/api/staff/sessions/:publicSessionId', async (request, response, context) => {
    try {
      const hasAccess = requireStaffAccess(request, response);
      if (!hasAccess) {
        return;
      }

      const session = await loadIntakeSessionByPublicSessionId(context.params.publicSessionId);
      return json(response, 200, { session });
    } catch (error) {
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to load intake session.'),
      });
    }
  });

  router.post('/api/staff/sessions/:publicSessionId/review', async (request, response, context) => {
    try {
      const hasAccess = requireStaffAccess(request, response);
      if (!hasAccess) {
        return;
      }

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
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to mark intake session reviewed.'),
      });
    }
  });

  router.get('/api/intake/sessions/:publicSessionId/pdf', async (request, response, context) => {
    try {
      const hasAccess = requireStaffAccess(request, response);
      if (!hasAccess) {
        return;
      }

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
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to generate intake PDF summary.'),
      });
    }
  });

  router.post('/api/intake/fields', async (request, response) => {
    try {
      const payload = await readJsonBody(request);
      const result = await saveFieldValue(payload);

      return json(response, 200, result);
    } catch (error) {
      const statusCode = getStatusCode(error);

      return json(response, statusCode, {
        error: getErrorLabel(error),
        message: getClientMessage(error, 'Unable to save intake field.'),
      });
    }
  });

  return router.all();
}

function getStatusCode(error) {
  if (
    error.code === 'INVALID_SESSION_ID' ||
    error.code === 'INVALID_FIELD_KEY' ||
    error.code === 'INVALID_SOURCE' ||
    error.code === 'INVALID_PUBLIC_SESSION_ID' ||
    error.code === 'INVALID_SOURCE_MODE' ||
    error.message === 'Request body must be valid JSON.'
  ) {
    return 400;
  }

  if (error.code === 'SESSION_NOT_FOUND') {
    return 404;
  }

  if (error.code === 'INVALID_SESSION_STATUS' || error.code === 'SUBMISSION_BLOCKED') {
    return 409;
  }

  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return 503;
  }

  return 500;
}

function getErrorLabel(error) {
  const statusCode = getStatusCode(error);

  if (statusCode === 404) return 'Not found';
  if (statusCode === 409 && error.code === 'SUBMISSION_BLOCKED') return 'Submission blocked';
  if (statusCode === 409 && error.code === 'INVALID_SESSION_STATUS') return 'Review blocked';
  if (statusCode === 503) return 'Service unavailable';
  if (statusCode === 500) return 'Internal server error';
  return 'Invalid request';
}

function getClientMessage(error, fallbackMessage) {
  if (error.code === 'PERSISTENCE_UNAVAILABLE') {
    return 'Persistence is unavailable in this environment.';
  }

  return getStatusCode(error) >= 500 ? fallbackMessage : error.message;
}

module.exports = {
  createIntakeRoutes,
};
