#!/usr/bin/env node
// This is an authenticated detail simulator, not a provider webhook verifier.
require('../src/config/env').getConfig();
async function main() {
  const callId = process.argv[2];
  if (!/^[a-f0-9-]{36}$/i.test(callId || '')) throw new Error('Pass an existing attempt UUID.');
  const base = process.env.INTAKE_API_BASE_URL || 'http://127.0.0.1:3001';
  const response = await fetch(`${base}/api/calls/${callId}/detail`, {
    method: 'PUT', headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.STAFF_SESSION_TOKEN || ''}` },
    body: JSON.stringify({ provider: 'mock', events: [{ eventType: 'simulation', source: 'simulator', providerEventId: `simulation:${callId}` }], transcriptTurns: [{ speaker: 'agent', text: 'Synthetic check-in demonstration.' }] }),
  });
  console.log(JSON.stringify({ status: response.status, body: await response.json() }));
  if (!response.ok) process.exitCode = 1;
}
main().catch(() => { console.error('SIMULATION_FAILED'); process.exitCode = 1; });
