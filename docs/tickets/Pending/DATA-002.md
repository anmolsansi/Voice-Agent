# DATA-002 — Persistence truth

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 41–45. Effort varies; these are review units, not equal percentages.
Dependencies: DATA-001, CALL-002.

## Problem, current behavior and target

Baseline: Some successful empty SQL reads returned cached records; detail batches could partially persist.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `src/lib/db/postgres.js`
- `src/modules/calls/store.js`
- `src/modules/calls/call-store.js`
- `src/modules/intake/session-store.js`
- `src/jobs/checkins.js`
- `tests/call-integrity.integration.test.cjs`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Production rejects memory fallback. Local public intake may use explicit memory only without DATABASE_URL. Authentication/call operations require database. Detail public IDs and transcript IDs cannot move across calls.

## Ordered microtasks and verification checkpoints

### 41 — Return missing when PostgreSQL returns no rows.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Deleted call/detail/intake cannot reappear from process cache.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [41/50] in its commit or grouped dependent commit.

### 42 — Fail closed on configured database failure.

Implement or inspect this behavior in the files above before proceeding. Completion proof: 503 instead of memory success even when fallback flag is set.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [42/50] in its commit or grouped dependent commit.

### 43 — Commit detail, events, transcripts and audit atomically.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Cross-call transcript collision rolls back earlier batch writes.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [43/50] in its commit or grouped dependent commit.

### 44 — Load schedules and actor from server-owned state.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Enqueue rejects request schedules/actor/time; repeated run is idempotent.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [44/50] in its commit or grouped dependent commit.

### 45 — Verify pool restart, deletion, outage, rollback and repeated enqueue.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Persisted data survives restart; partial mutations never survive failure.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [45/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

Do not repair an outage by serving cached domain records. Restore database connectivity and retry idempotent operations. Check audit and domain row together after injected failures.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
