# AUTH-002 — Session lifecycle

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 11–15. Effort varies; these are review units, not equal percentages.
Dependencies: AUTH-001.

## Problem, current behavior and target

Baseline: No per-user session revocation or persistent login throttling existed.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `src/modules/auth/service.js`
- `src/modules/auth/routes.js`
- `src/app.js`
- `tests/auth.integration.test.cjs`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Absolute expiry 12 hours, idle expiry 30 minutes. Generic 401 for invalid credentials. /me and /password allow forced-change sessions; ordinary access does not.

## Ordered microtasks and verification checkpoints

### 11 — Issue opaque session after generic credential verification.

Implement or inspect this behavior in the files above before proceeding. Completion proof: POST /api/auth/login returns token/user only after valid active account.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [11/50] in its commit or grouped dependent commit.

### 12 — Check absolute expiry, idle expiry, revocation and active user on every request.

Implement or inspect this behavior in the files above before proceeding. Completion proof: GET /api/auth/me rejects expired or disabled sessions immediately.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [12/50] in its commit or grouped dependent commit.

### 13 — Delete current session on logout.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Previously issued token becomes unauthorized.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [13/50] in its commit or grouped dependent commit.

### 14 — Reserve failed-login capacity transactionally before hashing.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Five account failures or 50 IP failures per 15 minutes yields 429/Retry-After.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [14/50] in its commit or grouped dependent commit.

### 15 — Test expiry, disabled account, revocation and durable throttling.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Counters and authorization survive pool restart; expired windows reset.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [15/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

Backend-observed proxy IP is shared behind Next.js. Do not trust arbitrary forwarded headers. A persistence outage returns 503, never an authenticated memory fallback.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
