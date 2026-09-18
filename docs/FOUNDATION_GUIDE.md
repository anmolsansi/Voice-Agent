# Foundation operations and contracts

This guide describes the foundation implementation, not clinical or commercial readiness.
Use only synthetic data. Each clinic gets a separate application/database deployment.
Voice/report screens remain labeled sample data. Telephony is simulated and recording writes are rejected.

## Runtime and setup

The browser uses Next.js. `src/app.js` dispatches backend HTTP routes with a default staff guard.
`src/modules/auth` owns accounts and revocable sessions. PostgreSQL is mandatory for authentication and calls.
`src/modules/calls/service.js` owns attempt lifecycle; `call-service.js` owns supplementary detail.
`src/services/*.mjs` and the voice fixture harness are prototypes, not operational persistence.

1. Run `npm ci` using Node 22 (CI) or the verified local runtime in FOUNDATION_PROGRESS.md.
2. Copy `.env.example` to a local environment file and set a dedicated PostgreSQL database URL.
3. Set `STAFF_AUTH_MODE=session`. Legacy and JWT modes now fail configuration validation.
4. Run `npm run db:migrate` before starting the new server.
5. Bootstrap the first admin using `STAFF_USER_EMAIL` and a password supplied through stdin to `npm run db:seed-staff`.
6. Run `npm run dev:backend` and `npm run dev:frontend`. Open the configured APP_URL at `/staff/login`.
7. Sign in and complete the required password change. The dashboard then becomes available.

Never put passwords in command arguments, shell history, logs, or committed files. One local interactive example for zsh:

```sh
read -s 'staff_password?Initial password: '
printf '%s' "$staff_password" | STAFF_USER_EMAIL=admin@example.test npm run db:seed-staff
unset staff_password
```

Bootstrap is idempotent for the same active admin and never changes that admin's password on a repeat invocation.
An existing installation with a different admin requires recovery, not a second bootstrap.
The command prints only user ID, role, and password-change state.

Recovery requires operator access to the deployment database. Verify the requesting person's identity out of band, supply a replacement password on stdin, set STAFF_USER_EMAIL, and run `npm run db:seed-staff -- --recover`.
Recovery re-enables that existing account as admin, revokes its sessions, records an operator audit event, and forces password change. It never creates an unknown account.

## Session and permission contract

Passwords use Node's asynchronous scrypt: N=131072, r=8, p=1, 16 random salt bytes, 64 derived bytes, versioned storage. At most two derivations run concurrently per process; excess requests receive 503 rather than exhausting memory. Passwords are 15–128 characters.

Sessions use 32 random bytes, represented as 64 hex characters. Only SHA-256 token hashes are stored. Absolute expiry is 12 hours and idle expiry is 30 minutes. Account status is read on every authenticated request. Logout deletes the session. Reset, disable, and role changes revoke all sessions for the account; self-service password change keeps the current session and revokes the others.

Browser tokens remain in host-only HTTP-only cookies. Production uses a Secure `__Host-` cookie. The browser never receives a token in JSON. Next.js forwards its session to the backend in `Authorization: Bearer <token>`; backend authorization does not depend on frontend middleware.

Browser mutations fetch `/api/staff/csrf` first, then send the returned token as `X-CSRF-Token`. Middleware requires an exact APP_URL origin and matching host-only CSRF cookie. This includes login, logout, password changes, and intake review. CSRF cookie rotates on login. Do not trust arbitrary forwarded-host or forwarded-IP headers.

Login reserves attempts transactionally before hashing: five failures per normalized account and 50 per backend-observed source IP per 15-minute window. Successful attempts release their own reservation, not other failures. Through Next.js the backend observes the proxy IP, so this IP bucket is intentionally shared by that proxy; do not enable untrusted X-Forwarded-For handling to change it. Counters persist across restarts. Expired buckets reset on next use. Size/resource protections return 413/503, throttling returns 429 plus Retry-After.

| Route | Input | Output / access |
|---|---|---|
| POST /api/auth/login | `{email,password}` | `{token,user,expiresAt}`; backend-only token contract, generic 401 on wrong credentials |
| GET /api/auth/me | Bearer session | `{user}`; permitted during forced password change |
| POST /api/auth/logout | Bearer session | `{ok:true}`; revoke current token |
| POST /api/auth/password | `{currentPassword,newPassword}` | `{ok:true}`; permitted during forced password change |
| GET /api/staff/users | Bearer admin | `{items: StaffUser[]}` (up to 500) |
| POST /api/staff/users | `{email,password,displayName,role}` | `201 {user}`; admin only; new user must change password |
| PATCH /api/staff/users/:userId | nonempty subset of `{role,disabled,password}` | `{user}`; admin only; last active admin cannot be removed |

StaffUser contains id, email, displayName, role, disabled, and mustChangePassword; no hashes or secrets.
User management is available through authenticated backend APIs; a staff-management UI is outside this foundation milestone.
The last-admin check and account management use one transaction-level advisory lock to serialize concurrent changes.

`care_staff` reads call/detail data, reports, PDF, and intake records and performs intake review.
`admin` also creates attempts, writes simulation status/detail, and manages accounts.
The scheduler token authorizes only POST `/api/jobs/checkins/enqueue`; it cannot authenticate as staff.
Missing credentials return 401; insufficient role or required password change returns 403.

## Data ownership and migration

Do not rename either existing 004 migration: both apply in filename order and are recorded independently.
005 adds staff users, sessions, and persistent login counters. 006 adds canonical relationships.

- `patients.id`: stable patient identity; contact values never imply identity equality.
- `checkin_schedules`: UUID patient foreign key and unique `(id,patient_id)` pair.
- `call_attempts`: patient/schedule foreign keys, unique `(schedule_id,attempt_number)`, creation-input fingerprint, last-transition payload.
- `calls.attempt_id`: nonnull unique reference to one attempt. Existing columns are compatibility data, not independent lifecycle ownership.
- Call-detail reads join the attempt for lifecycle, provider call ID, outcome, and transcript readiness.
- New call audits go only to `audit_logs`; old `call_audit_logs` remain readable historical evidence.
- Intake session state remains the existing intake representation. Anonymous intake records are not automatically merged into patients by name or phone.

Migration 006 fails with FOUNDATION_ORPHANS when patient/schedule references cannot be resolved exactly.
It fails with FOUNDATION_UNMAPPED_DETAILS when a historic call has no explicit `calls.metadata.attemptId` reference.
Audit these rows and supply independently verified UUID mappings before rerunning. Do not guess mappings, rename migration history, or silently discard records.
Legacy attempts have an empty creation fingerprint and cannot be replayed through the new creation API; use a new operation key for genuinely new work.
The migration test creates a separate database and verifies fresh apply, rollback/reapply, orphan rejection, explicit mapping, and uniqueness.

For synthetic fixtures only, set `ALLOW_SYNTHETIC_SEED=true` and run `node scripts/seed-synthetic.cjs` against a nonproduction database. It creates a fixed synthetic patient/schedule idempotently, without placing calls or resetting other data.

## Call contracts and invariants

| Route | Behavior |
|---|---|
| POST /api/calls | Admin; `{patientId,scheduleId,idempotencyKey,dueAt?,metadata?}` → `201 {call,created:true}` or `200 {call,created:false}` |
| GET /api/calls | Staff; optional patientId, scheduleId, status; `{items,total}` with existing 200-row cap; total is returned count |
| GET /api/calls/:callId | Staff; `{call,auditEvents}` |
| POST /api/calls/:callId/status | Admin; `{status,providerIds?,transcriptStatus?,errorDetails?}` → `{call}` |
| POST /api/calls/:callId/finalize | Admin; `{transcriptStatus?,outcome?,outcomeSummary?,escalationFlag?,errorDetails?}` → `{call}` |
| PUT /api/calls/:callId/detail | Admin; supplementary detail only → `{callDetail}` |
| GET /api/calls/:publicCallId/detail | Staff; compatibility public-ID lookup → `{callDetail}` |
| POST /api/jobs/checkins/enqueue | Machine bearer SCHEDULER_TOKEN (minimum 32 characters), empty JSON body; database supplies all schedules and server supplies actor/time |

Creation metadata accepts source, dueAt, timezone, retryCount only. Client IDs, attempt numbers, status, actors, and audit events are not writable creation fields.
Equivalent idempotency-key replays return the existing attempt. Different creation inputs return 409 IDEMPOTENCY_CONFLICT.
A schedule row lock serializes attempt allocation; a database unique constraint backs it up. An idempotency-key advisory lock serializes conflicting creation requests across schedules.

Allowed state changes:

```text
queued -> starting | canceled | failed
starting -> in_progress | failed | canceled
in_progress -> finalizing | failed | canceled
finalizing -> completed | failed
completed / failed / canceled -> no different state
```

Finalization uses the same state guard. An exactly identical last transition returns the current record without another audit event. A same-state request with different inputs is rejected. Lifecycle updates lock the attempt row and commit the audit event with the state write; audit failure rolls everything back.

Detail accepts publicCallId, intakeSessionId, provider, direction, transcriptUnavailableReason, events, and transcriptTurns.
Events accept eventType, source, sequence, occurredAt, providerEventId. Turns accept id, speaker, text, sequence, startedAt, endedAt, confidence, isPartial.
Collections are capped at 500 entries, turn text at 16000 characters, and total backend request body at 256 KiB.
Unknown fields, fabricated audit actors, recording payloads, and independent lifecycle writes are rejected.
Detail batches use one transaction including their mandatory audit event. Public detail IDs cannot move between attempts; transcript IDs cannot update another call's turn.

## Failure handling and observability

The backend generates X-Request-ID and no-store headers. Central errors return `{error:{code,message},requestId}`.
Existing intake response envelopes are preserved. Invalid JSON returns 400, large bodies 413, invalid transitions/conflicting keys 409, unavailable persistence 503. Server error logs contain request ID and safe code, never request bodies, credentials, or transcript contents.

Successful PostgreSQL reads returning no rows never fall back to cache. Calls and authentication require PostgreSQL. Only public intake local development/testing can explicitly use memory when no database URL exists; configured database failures never switch to memory. Production rejects memory fallback flags.

`503` during an audited write means do not claim success; retry with the same idempotency key where supported.
`409` means inspect state or conflicting inputs, not an automatic retry with a random key.
`401` means sign in; `403 PASSWORD_CHANGE_REQUIRED` means complete password change.
A reviewed intake is still submitted and its PDF remains available to authenticated staff.

## Verification and release procedure

Use a disposable database URL explicitly named by TEST_DATABASE_URL. Integration tests truncate their fixture tables. Never point it at a real clinic database.

```sh
npm ci
npm run db:migrate
npm test
npm run check:voice-agent
npm run test:integration
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests manage ports 3100/3101, exercise actual rendered forms, and write screenshots/traces under `/tmp/checkincare-browser-results`.
They test forced password change, desktop/mobile login, logout, patient entry/reload/submission, staff review, PDF, CSRF rejection, and expired/disabled access.
CI runs the same gates on Node 22/PostgreSQL 16. Hosted results are recorded separately from local results.

Before synthetic staging: provision a dedicated database, HTTPS origin, APP_URL, private backend network, and independent scheduler secret; apply migrations; bootstrap admin; verify password change, denial paths, intake/PDF, and database readiness. Do not expose the Node backend or database without deployment-layer controls.
No staging destination is configured in this repository; deployment must not be claimed from a local test run.

Rollback: retain additive schema and stored audit/data. Deploy only an application version compatible with these tables and authentication guarantees. If unavailable, stop scheduler and disable affected endpoints while fixing forward. Do not restore the old unauthenticated call APIs or shared-token deployment. Database down migrations are for isolated verification, not a production rollback recommendation.

## Boundaries and follow-up gates

Known inherited npm audit findings are recorded in FOUNDATION_PROGRESS.md. Dependency remediation and external deployment/security review remain release gates.
Geography, real providers, live-data policy, recording policy, and staffed follow-up responsibility must be decided before a real-call checkpoint.
The next commercial releases remain post-visit check-ins, voice-assisted intake, then standalone callback workflows. Each requires its entire agreed scope to pass; none is delivered by this foundation alone.
