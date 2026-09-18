const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('./password');
test('scrypt salts and verification reject wrong passwords and malformed hashes', async () => {
  const password = 'synthetic-password-for-tests';
  const hash = await hashPassword(password);
  assert.notEqual(hash, await hashPassword(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('incorrect', hash), false);
  assert.equal(await verifyPassword(password, undefined), false);
  await assert.rejects(hashPassword('short'), { code: 'INVALID_PASSWORD' });
  await assert.rejects(hashPassword('x'.repeat(129)), { code: 'INVALID_PASSWORD' });
});
