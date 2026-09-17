const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL must name an isolated migrated test database.');
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
process.env.STAFF_AUTH_MODE = 'session';
const { query, closePool } = require('../src/lib/db/postgres');
const auth = require('../src/modules/auth/service');
const { createApp } = require('../src/app');
const password = 'Synthetic-password-12345';
let admin, token, base, server;
before(async () => {
  await query('TRUNCATE staff_users, login_limits CASCADE');
  admin = await auth.createUser({ email: 'admin@example.test', password, displayName: 'Admin', role: 'admin' }, null, { bootstrap: true });
  const result = await auth.login({ email: admin.email, password }, 'auth-tests');
  token = result.token;
  await auth.changePassword(token, { currentPassword: password, newPassword: password + '-changed' });
  admin = await auth.authenticate(token);
  server = http.createServer(createApp({ appName: 'test', nodeEnv: 'test' }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise((r) => server.close(r)); await closePool(); });
test('bootstrap is idempotent, normalized duplicates conflict, session token is hashed', async () => {
  const again = await auth.createUser({ email: admin.email, password, displayName: 'Admin', role: 'admin' }, null, { bootstrap: true });
  assert.equal(again.id, admin.id);
  await assert.rejects(auth.createUser({ email: admin.email.toUpperCase(), password, displayName: 'Duplicate', role: 'admin' }, admin), { code: 'EMAIL_EXISTS' });
  const { rows } = await query('SELECT token_hash FROM staff_sessions');
  assert(!rows.some((row) => row.token_hash === token));
  assert(rows.some((row) => row.token_hash === auth.digest(token)));
});
test('direct backend and legacy token bypasses denied, care role cannot mutate calls', async () => {
  for (const path of ['/api/calls', '/api/staff/users', '/api/intake/sessions', '/api/staff/intakes']) {
    assert.equal((await fetch(base + path, { headers: { 'x-staff-access-token': 'legacy' } })).status, 401);
  }
  const staff = await auth.createUser({ email: 'care@example.test', password, displayName: 'Care', role: 'care_staff' }, admin);
  const login = await auth.login({ email: staff.email, password }, 'care-ip');
  await assert.rejects(auth.authenticate(login.token), { code: 'PASSWORD_CHANGE_REQUIRED' });
  await auth.changePassword(login.token, { currentPassword: password, newPassword: password + '-changed' });
  assert.equal((await fetch(base + '/api/staff/users', { headers: { authorization: `Bearer ${login.token}` } })).status, 403);
  await auth.updateUser(staff.id, { disabled: true }, admin);
  await assert.rejects(auth.authenticate(login.token), { code: 'UNAUTHORIZED' });
});
test('expiry, idle timeout, logout, password reset invalidate sessions', async () => {
  const login = () => auth.login({ email: admin.email, password: password + '-changed' }, 'expiry-ip');
  let session = await login();
  await query("UPDATE staff_sessions SET expires_at=now()-interval '1 second' WHERE token_hash=$1", [auth.digest(session.token)]);
  await assert.rejects(auth.authenticate(session.token), { code: 'UNAUTHORIZED' });
  session = await login();
  await query("UPDATE staff_sessions SET last_seen_at=now()-interval '31 minutes' WHERE token_hash=$1", [auth.digest(session.token)]);
  await assert.rejects(auth.authenticate(session.token), { code: 'UNAUTHORIZED' });
  session = await login();
  await auth.logout(session.token);
  await assert.rejects(auth.authenticate(session.token), { code: 'UNAUTHORIZED' });
});
test('last administrator cannot be disabled; concurrent demotions preserve one admin', async () => {
  await assert.rejects(auth.updateUser(admin.id, { disabled: true }, admin), { code: 'LAST_ADMIN' });
  const other = await auth.createUser({ email: 'other@example.test', password, displayName: 'Other', role: 'admin' }, admin);
  const outcomes = await Promise.allSettled([
    auth.updateUser(admin.id, { role: 'care_staff' }, admin),
    auth.updateUser(other.id, { role: 'care_staff' }, admin),
  ]);
  assert.equal(outcomes.filter((x) => x.status === 'fulfilled').length, 1);
  const { rows: [count] } = await query("SELECT count(*)::int AS n FROM staff_users WHERE role='admin' AND NOT disabled");
  assert.equal(count.n, 1);
  await auth.updateUser(admin.id, { role: 'admin', password, disabled: false }, null, { recovery: true });
  await assert.rejects(auth.authenticate(token), { code: 'UNAUTHORIZED' });
  const reset = await auth.login({ email: admin.email, password }, 'recovery-ip');
  await assert.rejects(auth.authenticate(reset.token), { code: 'PASSWORD_CHANGE_REQUIRED' });
});
test('login failure throttling is durable and shared across requests', async () => {
  for (let i = 0; i < 5; i++) await assert.rejects(auth.login({ email: 'missing@example.test', password }, 'throttle-ip'), { code: 'INVALID_CREDENTIALS' });
  await assert.rejects(auth.login({ email: 'missing@example.test', password }, 'different-ip'), { code: 'LOGIN_THROTTLED' });
  const { rows: [limit] } = await query('SELECT attempts FROM login_limits WHERE bucket=$1', [`account:${auth.digest('missing@example.test')}`]);
  assert.equal(limit.attempts, 5);
});
