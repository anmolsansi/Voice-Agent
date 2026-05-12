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

function main() {
  const email = arg('email', process.env.STAFF_USER_EMAIL || 'admin@example.com');
  const displayName = arg('display_name', process.env.STAFF_USER_DISPLAY_NAME || 'Clinic Admin');
  const role = arg('role', process.env.STAFF_USER_ROLE || 'admin');

  console.log(JSON.stringify({
    ok: true,
    mode: process.env.STAFF_AUTH_MODE || 'legacy',
    email,
    displayName,
    role,
    message: 'Staff user persistence is not part of the current pilot schema. Keep STAFF_AUTH_MODE=legacy and set STAFF_ACCESS_TOKEN for local dashboard access until the JWT staff-user schema lands.',
  }, null, 2));
}

main();
