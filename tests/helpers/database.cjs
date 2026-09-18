const { randomUUID } = require('node:crypto');
const http = require('node:http');
const { once } = require('node:events');
if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is required for PostgreSQL integration tests.');
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
process.env.STAFF_AUTH_MODE = 'session';
const { query, closePool } = require('../../src/lib/db/postgres');
const auth = require('../../src/modules/auth/service');
const { createApp } = require('../../src/app');
const { seedSchedule } = require('../../src/modules/calls/service');
async function setup() {
  await query('TRUNCATE staff_users, login_limits, patients, calls, checkin_schedules, call_attempts, audit_logs CASCADE');
  const password = 'Synthetic-only-test-password';
  const admin = await auth.createUser({ email: 'test@example.test', password, displayName: 'Test', role: 'admin' }, null, { bootstrap: true });
  const login = await auth.login({ email: admin.email, password }, 'test-ip');
  await auth.changePassword(login.token, { currentPassword: password, newPassword: password + '-changed' });
  const { rows: [patient] } = await query("INSERT INTO patients(first_name,last_name,date_of_birth) VALUES('Synthetic','Patient','1990-01-01') RETURNING id");
  const schedule = await seedSchedule({ patientId: patient.id, nextDueAt: '2026-01-01T00:00:00Z' });
  return { patientId: patient.id, scheduleId: schedule.id, idempotencyKey: randomUUID(), token: login.token };
}
async function api(token) {
  const server = http.createServer(createApp({ appName: 'test', nodeEnv: 'test' }));
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    base,
    request: (path, body, method = body === undefined ? 'GET' : 'POST', credential = token) => fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...(credential ? { Authorization: `Bearer ${credential}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
module.exports = { setup, api, query, closePool };
