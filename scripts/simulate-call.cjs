#!/usr/bin/env node
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
  const patientId = arg('patient-id', 'local-patient-001');
  const scheduleId = arg('schedule-id', 'local-schedule-001');
  const idempotencyKey = arg('idempotency-key', `local-sim:${patientId}:${scheduleId}`);

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/calls`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ patientId, scheduleId, idempotencyKey, metadata: { source: 'scripts/simulate-call' } }),
  });
  const body = await response.json().catch(() => null);

  console.log(JSON.stringify({ status: response.status, body }, null, 2));
  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
