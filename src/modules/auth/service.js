const { randomBytes, createHash } = require('node:crypto');
const { query, transaction } = require('../../lib/db/postgres');
const { hashPassword, verifyPassword } = require('./password');
const { fail, objectInput, uuid } = require('../../http/errors');
const digest = (value) => createHash('sha256').update(value).digest('hex');
const userView = (row) => ({ id: row.id, email: row.email, displayName: row.display_name, role: row.role, disabled: row.disabled, mustChangePassword: row.must_change_password });

function emailAddress(email) {
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw fail(400, 'VALIDATION_ERROR', 'A valid email is required.');
  }
  return email.trim().toLowerCase();
}
async function audit(action, entityId, actorId, metadata = {}) {
  await query(`INSERT INTO audit_logs(actor_type,actor_id,action,entity_type,entity_id,metadata)
    VALUES ($1,$2,$3,'staff_user',$4,$5)`, [actorId ? 'staff' : 'operator', actorId || null, action, entityId, metadata]);
}
async function login(input, ip) {
  objectInput(input, ['email', 'password']);
  const email = emailAddress(input.email);
  if (typeof input.password !== 'string' || input.password.length > 128) throw fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  // Reserve a failed-attempt slot before expensive hashing. Success releases its slots.
  const buckets = [`account:${digest(email)}`, `ip:${digest(ip || 'unknown')}`];
  const reservation = await transaction(async () => {
    const slots = [];
    for (const [index, bucket] of buckets.entries()) {
      await query('INSERT INTO login_limits(bucket) VALUES($1) ON CONFLICT DO NOTHING', [bucket]);
      const { rows: [limit] } = await query('SELECT *, window_start <= now() - interval \'15 minutes\' AS stale FROM login_limits WHERE bucket=$1 FOR UPDATE', [bucket]);
      if (limit.stale) await query('UPDATE login_limits SET attempts=0, window_start=now() WHERE bucket=$1', [bucket]);
      if (!limit.stale && limit.attempts >= (index === 0 ? 5 : 50)) throw fail(429, 'LOGIN_THROTTLED', 'Too many attempts. Try again in 15 minutes.');
      const { rows: [slot] } = await query('UPDATE login_limits SET attempts=attempts+1 WHERE bucket=$1 RETURNING window_start', [bucket]);
      slots.push(slot.window_start);
    }
    return slots;
  });
  const { rows: [user] } = await query('SELECT * FROM staff_users WHERE email=$1', [email]);
  let verified;
  try { verified = await verifyPassword(input.password, user?.password_hash); }
  catch (error) {
    if (error.code === 'AUTH_BUSY') await releaseReservation(buckets, reservation);
    throw error;
  }
  if (!verified || !user || user.disabled) throw fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  const token = randomBytes(32).toString('hex');
  return transaction(async () => {
    const { rows: [current] } = await query('SELECT * FROM staff_users WHERE id=$1 FOR UPDATE', [user.id]);
    if (current.disabled || current.password_hash !== user.password_hash) throw fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    await releaseReservation(buckets, reservation);
    const { rows: [session] } = await query('INSERT INTO staff_sessions(token_hash,user_id) VALUES($1,$2) RETURNING expires_at', [digest(token), user.id]);
    await audit('staff.login', user.id, user.id);
    return { token, user: userView(current), expiresAt: session.expires_at };
  });
}
async function releaseReservation(buckets, reservation) {
  for (const [i, bucket] of buckets.entries()) await query('UPDATE login_limits SET attempts=greatest(0,attempts-1) WHERE bucket=$1 AND window_start=$2', [bucket, reservation[i]]);
}
async function authenticate(token, { allowPasswordChange = false } = {}) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw fail(401, 'UNAUTHORIZED', 'Staff authentication required.');
  const { rows: [user] } = await query(`UPDATE staff_sessions s SET last_seen_at=now() FROM staff_users u
    WHERE s.token_hash=$1 AND u.id=s.user_id AND NOT u.disabled
      AND s.expires_at>now() AND s.last_seen_at>now()-interval '30 minutes'
    RETURNING u.*`, [digest(token)]);
  if (!user) throw fail(401, 'UNAUTHORIZED', 'Staff authentication required.');
  if (user.must_change_password && !allowPasswordChange) throw fail(403, 'PASSWORD_CHANGE_REQUIRED', 'Change your password before continuing.');
  return userView(user);
}
async function logout(token) {
  if (token) await query('DELETE FROM staff_sessions WHERE token_hash=$1', [digest(token)]);
}
async function changePassword(token, input) {
  objectInput(input, ['currentPassword', 'newPassword']);
  const user = await authenticate(token, { allowPasswordChange: true });
  const { rows: [row] } = await query('SELECT password_hash FROM staff_users WHERE id=$1', [user.id]);
  if (!(await verifyPassword(input.currentPassword, row.password_hash))) throw fail(401, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
  const hash = await hashPassword(input.newPassword);
  await transaction(async () => {
    const result = await query('UPDATE staff_users SET password_hash=$1,must_change_password=false WHERE id=$2 AND password_hash=$3 AND NOT disabled RETURNING id', [hash, user.id, row.password_hash]);
    if (!result.rowCount) throw fail(409, 'ACCOUNT_CHANGED', 'Account changed. Sign in again.');
    await query('DELETE FROM staff_sessions WHERE user_id=$1 AND token_hash<>$2', [user.id, digest(token)]);
    await audit('staff.password_changed', user.id, user.id);
  });
  return { ok: true };
}
async function assertAdmin(actor) {
  // Lock serializes disable/role changes with privileged writes and last-admin checks.
  const { rows: [user] } = await query('SELECT * FROM staff_users WHERE id=$1 FOR UPDATE', [actor.id]);
  if (!user || user.disabled || user.role !== 'admin' || user.must_change_password) throw fail(403, 'FORBIDDEN', 'Administrator access required.');
}
async function createUser(input, actor = null, { bootstrap = false } = {}) {
  objectInput(input, ['email', 'password', 'displayName', 'role']);
  const email = emailAddress(input.email);
  if (!['admin', 'care_staff'].includes(input.role) || typeof input.displayName !== 'string' || !input.displayName.trim() || input.displayName.length > 120) throw fail(400, 'VALIDATION_ERROR', 'Valid role and display name required.');
  const hash = await hashPassword(input.password);
  return transaction(async () => {
    await query('SELECT pg_advisory_xact_lock(33001)');
    if (!bootstrap) await assertAdmin(actor);
    else {
      const { rows } = await query('SELECT * FROM staff_users ORDER BY created_at');
      if (rows.length) {
        const existing = rows.find((u) => u.email === email && u.role === 'admin' && !u.disabled);
        if (existing) return userView(existing);
        throw fail(409, 'ALREADY_BOOTSTRAPPED', 'Use the recovery command for an existing installation.');
      }
    }
    try {
      const { rows: [user] } = await query('INSERT INTO staff_users(email,display_name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING *', [email, input.displayName.trim(), hash, bootstrap ? 'admin' : input.role]);
      await audit('staff.created', user.id, actor?.id);
      return userView(user);
    } catch (error) {
      if (error.code === '23505') throw fail(409, 'EMAIL_EXISTS', 'Email is already registered.');
      throw error;
    }
  });
}
async function listUsers(actor) {
  if (actor.role !== 'admin') throw fail(403, 'FORBIDDEN', 'Administrator access required.');
  const { rows } = await query('SELECT * FROM staff_users ORDER BY email LIMIT 500');
  return { items: rows.map(userView) };
}
async function updateUser(id, input, actor, { recovery = false } = {}) {
  uuid(id);
  objectInput(input, ['role', 'disabled', 'password']);
  if (!Object.keys(input).length || (input.role !== undefined && !['admin','care_staff'].includes(input.role)) || (input.disabled !== undefined && typeof input.disabled !== 'boolean')) throw fail(400, 'VALIDATION_ERROR', 'Invalid account update.');
  const hash = input.password === undefined ? null : await hashPassword(input.password);
  return transaction(async () => {
    await query('SELECT pg_advisory_xact_lock(33001)');
    if (!recovery) await assertAdmin(actor);
    const { rows: [user] } = await query('SELECT * FROM staff_users WHERE id=$1 FOR UPDATE', [id]);
    if (!user) throw fail(404, 'USER_NOT_FOUND', 'Staff user not found.');
    const role = input.role ?? user.role;
    const disabled = input.disabled ?? user.disabled;
    if (user.role === 'admin' && !user.disabled && (role !== 'admin' || disabled)) {
      const { rows: [count] } = await query("SELECT count(*)::int AS n FROM staff_users WHERE role='admin' AND NOT disabled");
      if (count.n <= 1) throw fail(409, 'LAST_ADMIN', 'Cannot remove the last active administrator.');
    }
    const { rows: [updated] } = await query('UPDATE staff_users SET role=$1,disabled=$2,password_hash=coalesce($3,password_hash),must_change_password=CASE WHEN $3::text IS NULL THEN must_change_password ELSE true END WHERE id=$4 RETURNING *', [role, disabled, hash, id]);
    await query('DELETE FROM staff_sessions WHERE user_id=$1', [id]);
    await audit(recovery ? 'staff.recovered' : 'staff.updated', id, actor?.id, { role, disabled, passwordReset: Boolean(hash) });
    return userView(updated);
  });
}
module.exports = { login, authenticate, logout, changePassword, createUser, listUsers, updateUser, digest };
