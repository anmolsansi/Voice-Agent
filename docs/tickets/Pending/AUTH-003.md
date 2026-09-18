# AUTH-003 — Staff lifecycle

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 16–20. Effort varies; these are review units, not equal percentages.
Dependencies: AUTH-002.

## Problem, current behavior and target

Baseline: There was no authoritative account administration or last-admin invariant.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `src/modules/auth/service.js`
- `src/modules/auth/routes.js`
- `scripts/seed-staff.cjs`
- `tests/auth.integration.test.cjs`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

GET/POST /api/staff/users and PATCH /api/staff/users/:userId require admin. PATCH accepts nonempty role/disabled/password subset. Recovery is CLI-only and never creates an unknown account.

## Ordered microtasks and verification checkpoints

### 16 — Provide admin-only create/list/role update.

Implement or inspect this behavior in the files above before proceeding. Completion proof: care_staff receives 403 for management and call writes.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [16/50] in its commit or grouped dependent commit.

### 17 — Disable account and revoke its sessions transactionally.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Old tokens fail immediately after disable completes.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [17/50] in its commit or grouped dependent commit.

### 18 — Reset password and force password change; self-change revokes other sessions.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Reset login reaches password-change page, not dashboard.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [18/50] in its commit or grouped dependent commit.

### 19 — Serialize management with advisory lock and protect last active admin.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Concurrent demotions leave at least one active admin.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [19/50] in its commit or grouped dependent commit.

### 20 — Test management, operator recovery and competing updates.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Recovery re-enables existing account, revokes sessions, audits and forces change.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [20/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

LAST_ADMIN is an intentional 409. Recover through trusted operator access, not a public registration or password-reset bypass.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
