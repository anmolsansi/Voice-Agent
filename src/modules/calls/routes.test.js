const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { createApp } = require('../../app');
const { closePool } = require('../../lib/db/postgres');
const { callStore } = require('./store');
const { enqueueEligibleCheckInCalls } = require('../../jobs/checkins');

async function resetStore() {
  await callStore.clearAll();
  await closePool();
  delete process.env.DATABASE_URL;
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
  process.env.NODE_ENV = 'test';
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

test.beforeEach(async () => {
  await resetStore();
});

test.after(async () => {
  await resetStore();
});

test('POST /api/calls creates idempotent call attempts and GET endpoints list/detail them', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const body = {
      patientId: 'patient-123',
      scheduleId: 'schedule-abc',
      idempotencyKey: 'same-call-window',
    };

    const firstResponse = await fetch(`${baseUrl}/api/calls`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const firstPayload = await firstResponse.json();

    const secondResponse = await fetch(`${baseUrl}/api/calls`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const secondPayload = await secondResponse.json();

    assert.equal(firstResponse.status, 201);
    assert.equal(secondResponse.status, 200);
    assert.equal(firstPayload.created, true);
    assert.equal(secondPayload.created, false);
    assert.equal(secondPayload.call.id, firstPayload.call.id);
    assert.equal(firstPayload.call.status, 'queued');
    assert.equal(firstPayload.call.attemptNumber, 1);
    assert.equal(firstPayload.call.transcriptStatus, 'not_started');

    const listResponse = await fetch(`${baseUrl}/api/calls?patientId=patient-123`);
    const listPayload = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.equal(listPayload.total, 1);
    assert.equal(listPayload.items[0].id, firstPayload.call.id);

    const detailResponse = await fetch(`${baseUrl}/api/calls/${firstPayload.call.id}`);
    const detailPayload = await detailResponse.json();
    assert.equal(detailResponse.status, 200);
    assert.equal(detailPayload.call.id, firstPayload.call.id);
    assert.equal(detailPayload.auditEvents[0].action, 'call.created');
  } finally {
    await stopTestServer(server);
  }
});

test('call status update and finalization return dashboard-ready timestamps and outcome fields', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const createResponse = await fetch(`${baseUrl}/api/calls`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ patientId: 'patient-123', scheduleId: 'schedule-abc' }),
    });
    const { call } = await createResponse.json();

    const statusResponse = await fetch(`${baseUrl}/api/calls/${call.id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        providerIds: { callId: 'telnyx-call-1', conversationId: 'conversation-1' },
        transcriptStatus: 'pending',
      }),
    });
    const statusPayload = await statusResponse.json();

    assert.equal(statusResponse.status, 200);
    assert.equal(statusPayload.call.status, 'in_progress');
    assert.ok(statusPayload.call.startedAt);
    assert.equal(statusPayload.call.providerIds.callId, 'telnyx-call-1');

    const finalizeResponse = await fetch(`${baseUrl}/api/calls/${call.id}/finalize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        transcriptStatus: 'pending',
        outcome: 'needs_follow_up',
        outcomeSummary: 'Patient requested a nurse callback after the check-in.',
        escalationFlag: true,
      }),
    });
    const finalizePayload = await finalizeResponse.json();

    assert.equal(finalizeResponse.status, 200);
    assert.equal(finalizePayload.call.status, 'completed');
    assert.equal(finalizePayload.call.outcome, 'needs_follow_up');
    assert.equal(finalizePayload.call.escalationFlag, true);
    assert.ok(finalizePayload.call.endedAt);
    assert.equal(finalizePayload.call.errorDetails, null);
  } finally {
    await stopTestServer(server);
  }
});

test('worker enqueues eligible schedules once and reports duplicate executions', async () => {
  const now = '2026-05-11T12:00:00.000Z';
  const schedules = [
    {
      id: '7d30d4ee-763d-4713-b992-67cb4b34f1c2',
      patientId: 'patient-123',
      status: 'active',
      timezone: 'America/Chicago',
      nextDueAt: '2026-05-11T11:55:00.000Z',
    },
  ];

  const firstResult = await enqueueEligibleCheckInCalls({ now, schedules });
  const secondResult = await enqueueEligibleCheckInCalls({ now, schedules });

  assert.equal(firstResult.evaluated, 1);
  assert.equal(firstResult.enqueued, 1);
  assert.equal(firstResult.duplicates, 0);
  assert.equal(secondResult.enqueued, 0);
  assert.equal(secondResult.duplicates, 1);
  assert.equal(secondResult.results[0].callId, firstResult.results[0].callId);
});

test('POST /api/jobs/checkins/enqueue accepts cron-compatible schedule payloads', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/jobs/checkins/enqueue`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        now: '2026-05-11T12:00:00.000Z',
        schedules: [
          {
            id: '3b63ed35-bd57-4275-9a99-b6b20c4f0eec',
            patientId: 'patient-456',
            status: 'active',
            nextDueAt: '2026-05-11T10:00:00.000Z',
          },
        ],
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.enqueued, 1);
    assert.equal(payload.results[0].status, 'enqueued');
  } finally {
    await stopTestServer(server);
  }
});
