#!/usr/bin/env node
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

function arg(name, fallback) {
  const args = process.argv.slice(2);
  const prefix = `--${name}=`;
  const inlineMatch = args.find((item) => item.startsWith(prefix));
  if (inlineMatch) {
    return inlineMatch.slice(prefix.length);
  }
  const separateIndex = args.indexOf(`--${name}`);
  if (separateIndex >= 0 && args[separateIndex + 1] && !args[separateIndex + 1].startsWith('--')) {
    return args[separateIndex + 1];
  }
  return fallback;
}

async function main() {
  const baseUrl = arg('base-url', process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`);
  const publicCallId = arg('public-call-id', `local_call_${Date.now()}`);
  const secret = process.env.WEBHOOK_SIGNING_SECRET || 'local-webhook-signing-secret';
  const payload = {
    publicCallId,
    provider: process.env.TELEPHONY_PROVIDER || 'mock',
    providerCallId: arg('provider-call-id', `provider_${publicCallId}`),
    direction: 'outbound',
    status: arg('status', 'completed'),
    transcriptStatus: 'complete',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    transcriptTurns: [
      { speaker: 'agent', text: 'Hello, this is a local webhook simulation.', sequence: 1 },
      { speaker: 'patient', text: 'I am confirming the check-in call worked.', sequence: 2 },
    ],
    events: [
      { type: 'webhook.simulated', occurredAt: new Date().toISOString(), payload: { source: 'scripts/simulate-webhook' } },
    ],
  };
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/calls`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-checkincare-webhook-signature': signature,
    },
    body: rawBody,
  });
  const body = await response.json().catch(() => null);

  console.log(JSON.stringify({ status: response.status, signatureHeader: 'x-checkincare-webhook-signature', body }, null, 2));
  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
