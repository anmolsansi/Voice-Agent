const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { createApp } = require('../../app');
const { intakeSessionStore } = require('./session-store');

function resetStore() {
  intakeSessionStore.sessions.clear();
  intakeSessionStore.submissions.clear();
}

function startTestServer() {
  const app = createApp({ appName: 'test', port: 0, nodeEnv: 'test' });
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

test('POST /api/intake/sessions/submit returns success for a complete session', async () => {
  resetStore();
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
  resetStore();
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
