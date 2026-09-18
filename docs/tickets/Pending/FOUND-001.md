# FOUND-001 — Reproducible baseline

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 01–05. Effort varies; these are review units, not equal percentages.
Dependencies: None.

## Problem, current behavior and target

Baseline: The repository claimed authentication and overlapping call features that runtime routes did not implement. Dependencies were missing.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `package.json`
- `package-lock.json`
- `src/app.js`
- `src/modules/calls/routes.js`
- `db/run-migrations.cjs`
- `docs/repo_context.md`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Do not rename either 004 migration. The migration runner tracks full filenames.

## Ordered microtasks and verification checkpoints

### 01 — Install locked dependencies; record Node/npm versions.

Implement or inspect this behavior in the files above before proceeding. Completion proof: npm ci succeeds without regenerating dependency versions.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [01/50] in its commit or grouped dependent commit.

### 02 — Run lint, types, ordinary tests, fixtures, production build.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Record failures separately from sandbox permission failures; baseline was 22 tests passing.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [02/50] in its commit or grouped dependent commit.

### 03 — Trace route registration and actual browser/simulator callers.

Implement or inspect this behavior in the files above before proceeding. Completion proof: List public intake, staff, call, health, and scheduler boundaries in repository context.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [03/50] in its commit or grouped dependent commit.

### 04 — Apply migration files to an empty isolated PostgreSQL database.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Both 004 filenames appear separately in migration history.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [04/50] in its commit or grouped dependent commit.

### 05 — Replace stale current-context claims with inspected behavior.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Current documentation points to the foundation guide and labels old material historical.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [05/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run check:voice-agent
npm run build
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

Missing dependencies: run npm ci. EPERM when binding localhost: run tests in an environment permitted to bind sockets. Audit advisories require separate remediation, not a claim that tests prove security.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
