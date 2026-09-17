#!/usr/bin/env node
const { createUser, updateUser } = require('../src/modules/auth/service');
const { getConfig } = require('../src/config/env');
const { query, closePool } = require('../src/lib/db/postgres');
async function main() {
  getConfig({ strict: true });
  let password = '';
  for await (const chunk of process.stdin) {
    password += chunk;
    if (password.length > 256) throw new Error('Password input too large.');
  }
  password = password.replace(/\r?\n$/, '');
  const email = process.env.STAFF_USER_EMAIL;
  let user;
  if (process.argv.includes('--recover')) {
    if (!email) throw new Error('STAFF_USER_EMAIL required.');
    const { rows: [existing] } = await query('SELECT id FROM staff_users WHERE email=$1', [email.trim().toLowerCase()]);
    if (!existing) throw new Error('Recovery requires an existing account.');
    user = await updateUser(existing.id, { password, disabled: false, role: 'admin' }, null, { recovery: true });
  } else {
    user = await createUser({ email, password, displayName: process.env.STAFF_USER_DISPLAY_NAME || 'Clinic Admin', role: 'admin' }, null, { bootstrap: true });
  }
  console.log(JSON.stringify({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword }));
}
main().catch((error) => { console.error(error.code || 'BOOTSTRAP_FAILED'); process.exitCode = 1; }).finally(closePool);
