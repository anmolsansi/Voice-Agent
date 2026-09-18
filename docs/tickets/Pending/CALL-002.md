# CALL-002 — State and concurrency

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 36–40. Effort varies; these are review units, not equal percentages.
Dependencies: CALL-001.

## Problem, current behavior and target

Baseline: Call writes lacked a single transition guard and atomic audit/idempotency guarantees.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `src/modules/calls/service.js`
- `src/modules/calls/store.js`
- `src/lib/db/postgres.js`
- `tests/call-integrity.integration.test.cjs`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

queued→starting/canceled/failed; starting→in_progress/failed/canceled; in_progress→finalizing/failed/canceled; finalizing→completed/failed. Terminal metadata uses detail path. Row locks and unique constraints back invariants.

## Ordered microtasks and verification checkpoints

### 36 — Enforce transition table on status and finalize.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Terminal states cannot reopen; only identical last-transition replay is a no-op.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [36/50] in its commit or grouped dependent commit.

### 37 — Serialize idempotency-key creation and compare canonical inputs.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Equivalent requests share attempt; conflicting request is409.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [37/50] in its commit or grouped dependent commit.

### 38 — Lock schedule when allocating max attempt number plus one.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Eight competing creations receive distinct ordered numbers.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [38/50] in its commit or grouped dependent commit.

### 39 — Commit lifecycle and mandatory audit in same transaction.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Injected audit failure leaves no attempt or changed state.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [39/50] in its commit or grouped dependent commit.

### 40 — Race terminal updates and verify replay/audit counts.

Implement or inspect this behavior in the files above before proceeding. Completion proof: One winning transition; no contradictory terminal states or duplicate audit.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [40/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

409 indicates state/input conflict, not a reason to invent a new idempotency key. 503 after audit failure means rollback; check persisted state before retry.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
