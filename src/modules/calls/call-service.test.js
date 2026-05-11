const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { createApp } = require('../../app');
const { closePool } = require('../../lib/db/postgres');
const { callDetailStore } = require('./call-store');
const { persistCallDetail } = require('./call-service');

async function resetStore() {
  await callDetailStore.clearAll();
  await closePool();
  delete process.env.DATABASE_URL;
  delete process.env.ALLOW_MEMORY_FALLBACK;
  delete process.env.STORE_RECORDING_URLS;
  delete process.env.PROVIDER_RECORDING_URLS_ENABLED;
  process.env.NODE_ENV = 'test';
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

test.beforeEach(async () => {
  await resetStore();
  process.env.ALLOW_MEMORY_FALLBACK = 'true';
});

test.after(async () => {
  await resetStore();
});

test('persistCallDetail orders transcript turns by timestamp and sequence', async () => {
  const detail = await persistCallDetail({
    publicCallId: 'call_ordering',
    provider: 'unit-test',
    status: 'completed',
    transcriptStatus: 'complete',
    transcriptTurns: [
      {
        speaker: 'patient',
        text: 'Second by sequence',
        sequence: 2,
        startedAt: '2026-05-11T10:00:03.000Z',
      },
      {
        speaker: 'agent',
        text: 'First by time',
        sequence: 5,
        startedAt: '2026-05-11T10:00:01.000Z',
      },
      {
        speaker: 'patient',
        text: 'Second by time, first by sequence',
        sequence: 1,
        startedAt: '2026-05-11T10:00:03.000Z',
      },
    ],
  });

  assert.deepEqual(
    detail.transcript.turns.map((turn) => turn.text),
    ['First by time', 'Second by time, first by sequence', 'Second by sequence'],
  );
  assert.equal(detail.transcript.status, 'complete');
});

test('GET /api/calls/:publicCallId/detail returns stable detail shape and redacts recording URL by default', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const createResponse = await fetch(`${baseUrl}/api/calls`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        publicCallId: 'call_api_shape',
        provider: 'voice-provider',
        providerCallId: 'provider-123',
        direction: 'outbound',
        status: 'completed',
        transcriptStatus: 'partial',
        startedAt: '2026-05-11T11:00:00.000Z',
        outcome: { disposition: 'callback_needed' },
        events: [
          {
            eventType: 'Provider.Call Started',
            source: 'provider',
            providerEventId: 'evt-1',
            occurredAt: '2026-05-11T11:00:00.000Z',
            rawPayloadRef: 's3://payloads/evt-1.json',
          },
        ],
        transcriptTurns: [
          {
            speaker: 'agent',
            text: 'Hello, this is CheckIn Care.',
            startedAt: '2026-05-11T11:00:01.000Z',
            confidence: 0.98,
            promptId: 'welcome',
            stateId: 'greeting',
          },
        ],
        recording: {
          providerRecordingId: 'rec-1',
          status: 'available',
          url: 'https://recordings.example.test/rec-1.wav',
          durationSeconds: 42,
          format: 'wav',
        },
        auditLogs: [
          {
            actorType: 'system',
            action: 'call_completed',
            entityType: 'call',
          },
        ],
      }),
    });

    assert.equal(createResponse.status, 201);

    const response = await fetch(`${baseUrl}/api/calls/call_api_shape/detail`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.callDetail.call.publicCallId, 'call_api_shape');
    assert.equal(payload.callDetail.timeline[0].eventType, 'provider_call_started');
    assert.equal(payload.callDetail.timeline[0].rawPayloadRef, 's3://payloads/evt-1.json');
    assert.equal(payload.callDetail.transcript.status, 'partial');
    assert.equal(payload.callDetail.transcript.turns[0].speaker, 'agent');
    assert.equal(payload.callDetail.transcript.turns[0].promptId, 'welcome');
    assert.equal(payload.callDetail.outcome.disposition, 'callback_needed');
    assert.equal(payload.callDetail.recording.available, true);
    assert.equal(payload.callDetail.recording.urlStored, false);
    assert.equal(payload.callDetail.recording.url, null);
    assert.equal(payload.callDetail.auditLogs[0].action, 'call_completed');
  } finally {
    await stopTestServer(server);
  }
});

test('delayed transcript state is represented when no turns are available yet', async () => {
  const detail = await persistCallDetail({
    publicCallId: 'call_delayed_transcript',
    provider: 'unit-test',
    status: 'completed',
    transcriptStatus: 'delayed',
    transcriptUnavailableReason: 'provider_processing',
  });

  assert.equal(detail.transcript.status, 'delayed');
  assert.equal(detail.transcript.isDelayed, true);
  assert.equal(detail.transcript.unavailableReason, 'provider_processing');
  assert.deepEqual(detail.transcript.turns, []);
});
