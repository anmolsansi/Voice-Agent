const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { createApp } = require('../../app');
const { closePool } = require('../../lib/db/postgres');
const { intakeSessionStore } = require('./session-store');

const STAFF_ACCESS_TOKEN = 'test-staff-token';

async function resetStore() {
  await intakeSessionStore.clearAll();
  await closePool();
  delete process.env.DATABASE_URL;
  delete process.env.ALLOW_MEMORY_FALLBACK;
  process.env.NODE_ENV = 'test';
  process.env.STAFF_ACCESS_TOKEN = STAFF_ACCESS_TOKEN;
}

function startTestServer(nodeEnv = 'test') {
  const app = createApp({ appName: 'test', port: 0, nodeEnv });
  const server = http.createServer(app);

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function stopTestServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function createSession(baseUrl) {
  const response = await fetch(`${baseUrl}/api/intake/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sourceMode: 'manual' }),
  });
  const payload = await response.json();
  return payload.session;
}

async function saveField(baseUrl, sessionId, fieldKey, value) {
  const response = await fetch(`${baseUrl}/api/intake/fields`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId, fieldKey, value, source: 'manual' }),
  });

  assert.equal(response.status, 200);
}

function getStaffHeaders(headers = {}) {
  return {
    ...headers,
    'x-staff-access-token': STAFF_ACCESS_TOKEN,
  };
}

function decodePdfText(buffer) {
  const content = buffer.toString('latin1');
  const hexChunks = content.match(/<([0-9A-Fa-f]+)>/g) || [];

  return hexChunks
    .map((chunk) => Buffer.from(chunk.slice(1, -1), 'hex').toString('latin1'))
    .join(' ');
}

test.beforeEach(async () => {
  await resetStore();
});

test.after(async () => {
  await resetStore();
});

test('POST /api/intake/sessions/submit returns success for a complete session', async () => {
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  const { server, baseUrl } = await startTestServer();

  try {
    const session = await createSession(baseUrl);

    await saveField(baseUrl, session.id, 'patient.firstName', 'Ada');
    await saveField(baseUrl, session.id, 'patient.lastName', 'Lovelace');
    await saveField(baseUrl, session.id, 'patient.dateOfBirth', '1990-04-20');
    await saveField(baseUrl, session.id, 'patient.phone', '(312) 555-0100');
    await saveField(baseUrl, session.id, 'patient.sexAtBirth', 'female');
    await saveField(baseUrl, session.id, 'visit.chiefComplaint', 'Sore throat');
    await saveField(baseUrl, session.id, 'consent.treatmentConsent', true);
    await saveField(baseUrl, session.id, 'consent.signatureName', 'Ada Lovelace');

    const response = await fetch(`${baseUrl}/api/intake/sessions/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'submitted');
    assert.ok(payload.submittedAt);
    assert.equal(payload.validation.isSubmittable, true);
  } finally {
    await stopTestServer(server);
  }
});

test('POST /api/intake/sessions/submit returns clear validation details for an incomplete session', async () => {
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  const { server, baseUrl } = await startTestServer();

  try {
    const session = await createSession(baseUrl);

    await saveField(baseUrl, session.id, 'patient.firstName', 'Ada');

    const response = await fetch(`${baseUrl}/api/intake/sessions/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    });
    const payload = await response.json();

    assert.equal(response.status, 409);
    assert.equal(payload.error, 'Submission blocked');
    assert.equal(payload.validation.isSubmittable, false);
    assert.ok(payload.validation.incompleteRequiredFields.includes('patient.lastName'));
    assert.ok(payload.validation.incompleteRequiredFields.includes('visit.chiefComplaint'));
    assert.ok(payload.validation.incompleteRequiredFields.includes('consent.signatureName'));
    assert.deepEqual(
      payload.validation.incompleteSections.map((section) => section.key),
      ['demographics', 'visit_reason', 'consent'],
    );
  } finally {
    await stopTestServer(server);
  }
});

test('POST /api/staff/sessions/:publicSessionId/review marks a submitted session reviewed', async () => {
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  const { server, baseUrl } = await startTestServer();

  try {
    const session = await createSession(baseUrl);

    await saveField(baseUrl, session.id, 'patient.firstName', 'Ada');
    await saveField(baseUrl, session.id, 'patient.lastName', 'Lovelace');
    await saveField(baseUrl, session.id, 'patient.dateOfBirth', '1990-04-20');
    await saveField(baseUrl, session.id, 'patient.phone', '(312) 555-0100');
    await saveField(baseUrl, session.id, 'patient.sexAtBirth', 'female');
    await saveField(baseUrl, session.id, 'visit.chiefComplaint', 'Sore throat');
    await saveField(baseUrl, session.id, 'consent.treatmentConsent', true);
    await saveField(baseUrl, session.id, 'consent.signatureName', 'Ada Lovelace');

    const submitResponse = await fetch(`${baseUrl}/api/intake/sessions/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    });

    assert.equal(submitResponse.status, 200);

    const response = await fetch(`${baseUrl}/api/staff/sessions/${session.publicSessionId}/review`, {
      method: 'POST',
      headers: getStaffHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify({ notes: 'Ready for staff callback.' }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.session.status, 'reviewed');
    assert.equal(payload.session.reviewNotes, 'Ready for staff callback.');
    assert.ok(payload.session.reviewedAt);
  } finally {
    await stopTestServer(server);
  }
});

test('GET /api/intake/sessions/:publicSessionId/pdf returns a PDF summary for a submitted session', async () => {
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  const { server, baseUrl } = await startTestServer();

  try {
    const session = await createSession(baseUrl);

    await saveField(baseUrl, session.id, 'patient.firstName', 'Ada');
    await saveField(baseUrl, session.id, 'patient.lastName', 'Lovelace');
    await saveField(baseUrl, session.id, 'patient.dateOfBirth', '1990-04-20');
    await saveField(baseUrl, session.id, 'patient.phone', '(312) 555-0100');
    await saveField(baseUrl, session.id, 'patient.sexAtBirth', 'female');
    await saveField(baseUrl, session.id, 'visit.chiefComplaint', 'Sore throat');
    await saveField(baseUrl, session.id, 'consent.treatmentConsent', true);
    await saveField(baseUrl, session.id, 'consent.signatureName', 'Ada Lovelace');

    const submitResponse = await fetch(`${baseUrl}/api/intake/sessions/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    });
    const submitPayload = await submitResponse.json();

    assert.equal(submitResponse.status, 200);

    const response = await fetch(`${baseUrl}/api/intake/sessions/${session.publicSessionId}/pdf`, {
      headers: getStaffHeaders(),
    });
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    const decodedPdfText = decodePdfText(pdfBuffer);
    const normalizedPdfText = decodedPdfText.replace(/\s+/g, '').toLowerCase();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/pdf');
    assert.match(response.headers.get('content-disposition'), /inline; filename=".*-summary\.pdf"/);
    assert.match(normalizedPdfText, /checkincareintakesummary/);
    assert.match(normalizedPdfText, /adalovelace/);
    assert.match(normalizedPdfText, /sorethroat/);
    assert.match(normalizedPdfText, /treatmentconsentconfirmed:yes/);
    assert.match(normalizedPdfText, /submissiontimestamp:/);
    assert.match(normalizedPdfText, new RegExp(submitPayload.submittedAt.slice(0, 4)));
  } finally {
    await stopTestServer(server);
  }
});

test('pilot-like mode fails closed for intake persistence when DATABASE_URL is missing', async () => {
  process.env.NODE_ENV = 'production';
  const { server, baseUrl } = await startTestServer('production');

  try {
    const createResponse = await fetch(`${baseUrl}/api/intake/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sourceMode: 'manual' }),
    });
    const createPayload = await createResponse.json();

    assert.equal(createResponse.status, 503);
    assert.equal(createPayload.error, 'Service unavailable');
    assert.equal(createPayload.message, 'Persistence is unavailable in this environment.');

    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthPayload = await healthResponse.json();

    assert.equal(healthResponse.status, 503);
    assert.equal(healthPayload.persistence.ready, false);
    assert.equal(healthPayload.persistence.mode, 'database-required');

    const readyResponse = await fetch(`${baseUrl}/ready`);
    const readyPayload = await readyResponse.json();

    assert.equal(readyResponse.status, 503);
    assert.equal(readyPayload.ready, false);
    assert.equal(readyPayload.persistence.mode, 'database-required');
  } finally {
    await stopTestServer(server);
  }
});

test('explicit memory fallback is surfaced in health and allows local persistence without DATABASE_URL', async () => {
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  const { server, baseUrl } = await startTestServer('production');

  try {
    const createResponse = await fetch(`${baseUrl}/api/intake/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sourceMode: 'manual' }),
    });
    const createPayload = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.ok(createPayload.session.id);

    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthPayload = await healthResponse.json();

    assert.equal(healthResponse.status, 200);
    assert.equal(healthPayload.persistence.ready, true);
    assert.equal(healthPayload.persistence.mode, 'memory-fallback');
    assert.match(healthPayload.persistence.reason, /in-memory fallback/i);
  } finally {
    await stopTestServer(server);
  }
});
