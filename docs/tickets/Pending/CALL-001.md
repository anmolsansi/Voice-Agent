# CALL-001 — Route and payload correctness

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 31–35. Effort varies; these are review units, not equal percentages.
Dependencies: AUTH-004, DATA-001.

## Problem, current behavior and target

Baseline: Two call-list registrations and overloaded POST semantics created ambiguity and an undefined-helper error path.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `src/modules/calls/routes.js`
- `src/modules/calls/call-service.js`
- `src/http/request.js`
- `src/http/router.js`
- `scripts/simulate-call.cjs`
- `scripts/simulate-webhook.cjs`
- `src/modules/calls/routes.test.js`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

POST /api/calls accepts patientId,scheduleId,idempotencyKey,dueAt,metadata. PUT /api/calls/:attemptId/detail accepts supplementary events/turns only. GET /api/calls/:publicCallId/detail retains compatibility.

## Ordered microtasks and verification checkpoints

### 31 — Keep one call-list route and central safe errors.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Duplicate registration is detected and error paths return safe envelopes.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [31/50] in its commit or grouped dependent commit.

### 32 — Whitelist attempt creation fields and derive actor from authenticated context.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Forged actor/status/attempt-number fields return 400.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [32/50] in its commit or grouped dependent commit.

### 33 — Write supplementary detail only through PUT attempt/detail.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Compatibility public-ID GET still returns existing shape.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [33/50] in its commit or grouped dependent commit.

### 34 — Bound body parsing and reject invalid JSON safely.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Backend >256KiB is 413; malformed/nonobject JSON is 400; browser auth caps at16KiB.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [34/50] in its commit or grouped dependent commit.

### 35 — Exercise contracts and linked detail constraints.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Read/write contracts and recording rejection pass without exposing historical URLs.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [35/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
TEST_DATABASE_URL=<disposable-url> npm run test:integration
TEST_DATABASE_URL=<disposable-url> npm run test:browser
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

409 DETAIL_ID_CONFLICT: identifier is owned by another attempt. Do not bypass by rewriting ownership. Correlate 503 with request ID; never log payloads or credentials.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
