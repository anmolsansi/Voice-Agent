# AUTH-001 — Account persistence

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 06–10. Effort varies; these are review units, not equal percentages.
Dependencies: FOUND-001.

## Problem, current behavior and target

Baseline: Staff access used a shared token and the bootstrap command was a placeholder.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `db/migrations/005_staff_identity.cjs`
- `src/modules/auth/password.js`
- `src/modules/auth/service.js`
- `scripts/seed-staff.cjs`
- `src/modules/auth/password.test.js`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Password length 15–128; scrypt N=131072,r=8,p=1,maxmem=160MiB; two concurrent derivations. Session token is 32 random bytes, persisted only as SHA-256.

## Ordered microtasks and verification checkpoints

### 06 — Persist normalized unique email, display name, role, disabled flag and password hash.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Duplicate normalized emails return EMAIL_EXISTS, never create a second user.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [06/50] in its commit or grouped dependent commit.

### 07 — Persist token hashes and session absolute/idle timestamps.

Implement or inspect this behavior in the files above before proceeding. Completion proof: No raw token is stored; user deletion cascades sessions.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [07/50] in its commit or grouped dependent commit.

### 08 — Use async versioned scrypt with unique salt and bounded parallelism.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Correct/wrong password and salt tests pass; overload fails safely.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [08/50] in its commit or grouped dependent commit.

### 09 — Bootstrap an admin through password stdin and explicit email.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Repeat same active admin is idempotent and does not reset password.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [09/50] in its commit or grouped dependent commit.

### 10 — Exercise invalid input, duplicate accounts and operator failure paths.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Malformed/unknown recovery exits nonzero without credential logging.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [10/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
npm test
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

AUTH_BUSY means bounded hash capacity was reached. Test resource limits on deployment hardware. Bootstrap requires PostgreSQL and operator access; do not put passwords in shell arguments.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
