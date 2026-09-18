const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { fail } = require('../../http/errors');
const derive = promisify(scrypt);
const parameters = { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 };
let active = 0;

async function key(password, salt) {
  // Bound memory across simultaneous logins; never weaken stored hash parameters.
  if (active >= 2) throw fail(503, 'AUTH_BUSY', 'Authentication is busy. Try again.');
  active++;
  try { return await derive(password, salt, 64, parameters); }
  finally { active--; }
}
async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 15 || password.length > 128) {
    throw fail(400, 'INVALID_PASSWORD', 'Use a password of 15 to 128 characters.');
  }
  const salt = randomBytes(16).toString('hex');
  return `scrypt-v1:${salt}:${(await key(password, salt)).toString('hex')}`;
}
async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [version, salt, expected] = String(hash || '').split(':');
  const valid = version === 'scrypt-v1' && /^[a-f0-9]{32}$/.test(salt) && /^[a-f0-9]{128}$/.test(expected);
  // Same expensive operation for a missing account; do not expose account existence.
  const actual = await key(password, valid ? salt : '00000000000000000000000000000000');
  return timingSafeEqual(actual, Buffer.from(valid ? expected : '0'.repeat(128), 'hex')) && valid;
}
module.exports = { hashPassword, verifyPassword };
