# DATA-001 — Canonical relationships

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 26–30. Effort varies; these are review units, not equal percentages.
Dependencies: FOUND-001.

## Problem, current behavior and target

Baseline: Patient/schedule identifiers lacked enforced relationships and detail records had independent lifecycle ownership.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `db/migrations/006_canonical_calls.cjs`
- `scripts/seed-synthetic.cjs`
- `src/modules/calls/call-store.js`
- `tests/migrations.integration.test.cjs`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Legacy calls need explicit calls.metadata.attemptId mapping before 006. Never infer links from phone/name. patients owns identity, call_attempts lifecycle, calls supplementary detail.

## Ordered microtasks and verification checkpoints

### 26 — Validate and add patient/schedule foreign keys.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Unmapped legacy rows fail with explicit orphan diagnostic.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [26/50] in its commit or grouped dependent commit.

### 27 — Add calls.attempt_id unique nonnull foreign key.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Each detail belongs to exactly one attempt and cannot move.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [27/50] in its commit or grouped dependent commit.

### 28 — Seed fixed synthetic patient/schedule UUIDs idempotently.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Repeat seed creates no duplicate identity or call.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [28/50] in its commit or grouped dependent commit.

### 29 — Project lifecycle from attempt in detail reads.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Caller cannot independently write detail status or outcome.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [29/50] in its commit or grouped dependent commit.

### 30 — Verify fresh migrations and additive upgrade diagnostics.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Both 004 files, orphan rejection, explicit mapping and unique constraints pass.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [30/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
DATABASE_URL=<disposable-url> npm run db:migrate
TEST_DATABASE_URL=<disposable-url> npm run test:integration
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

FOUNDATION_ORPHANS or FOUNDATION_UNMAPPED_DETAILS means stop and audit exact IDs. Reset only an explicitly disposable synthetic database; never silently delete rows.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
