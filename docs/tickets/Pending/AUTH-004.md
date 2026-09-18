# AUTH-004 — Browser and backend enforcement

Status: implemented for verification/review; approval is not implied by this packet.
Parent: [foundation checklist](../../FOUNDATION_PROGRESS.md), GitHub #33.
Microtasks: 21–25. Effort varies; these are review units, not equal percentages.
Dependencies: AUTH-002, AUTH-003.

## Problem, current behavior and target

Baseline: Browser access-code checks could be bypassed by directly calling backend routes.
Target: the implementation below makes the stated invariant durable and testable while keeping one clinic per deployment, synthetic data and simulated calls.
This packet describes the implemented contract for independent verification. Consult the parent evidence before marking accepted.

## Inspected files and ownership

- `middleware.ts`
- `lib/staff-auth.ts`
- `lib/staff-client.ts`
- `lib/bounded-body.ts`
- `app/api/staff/login/route.ts`
- `app/api/staff/password/route.ts`
- `src/app.js`
- `src/modules/intake/routes.js`
- `components/staff-login-form.tsx`

Next.js owns browser cookies and presentation; Node owns identity, permissions and mutations; PostgreSQL owns durable data. No telephony/provider integration, recordings, shared multi-tenant layer or queue infrastructure is added.

## Contract and implementation decisions

Session navigation middleware is convenience only. Backend default route access is staff. Explicit public routes retain intake behavior. SCHEDULER_TOKEN is independent and at least 32 characters.

## Ordered microtasks and verification checkpoints

### 21 — Replace shared-code UI with email/password and forced-change states.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Rendered login and password-change forms complete successfully.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [21/50] in its commit or grouped dependent commit.

### 22 — Keep token in HTTP-only cookie and forward session; check exact Origin and CSRF.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Browser JSON never exposes session token; unsafe requests without CSRF are 403.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [22/50] in its commit or grouped dependent commit.

### 23 — Protect intake staff review, PDF, report and export handlers.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Disabled/expired sessions cannot access report or dashboard data.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [23/50] in its commit or grouped dependent commit.

### 24 — Guard call routes at backend and isolate scheduler credential.

Implement or inspect this behavior in the files above before proceeding. Completion proof: No credential yields 401 before domain access; machine token cannot impersonate staff.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [24/50] in its commit or grouped dependent commit.

### 25 — Test bypasses, browser expiry and legacy configuration rejection.

Implement or inspect this behavior in the files above before proceeding. Completion proof: Integration and browser denial cases pass; production uses Secure host-only cookie.
If the checkpoint fails, diagnose the concrete failing assertion before advancing. Keep this logical change independently reviewable and reference #33 and [25/50] in its commit or grouped dependent commit.

## Verification procedure

Prerequisites: locked dependencies installed, migrated disposable PostgreSQL16 database, session auth configuration. Use a separate database from any running application. Integration/browser tests reset fixture tables and must run sequentially against the same fixture database.

Commands (substitute the disposable URL without exposing credentials):

```sh
npm run typecheck
TEST_DATABASE_URL=<disposable-url> npm run test:integration
TEST_DATABASE_URL=<disposable-url> npm run test:browser
```

Expected: all relevant assertions pass; invalid credentials/roles are 401/403, invalid payloads400, conflicts409, oversized requests413, throttling429, unavailable persistence503. Public intake continues through submission/review/PDF. Capture exit status and failing test name; a build alone does not establish runtime correctness.

## Failure diagnosis and escalation

403 on browser mutation: inspect APP_URL exact origin and CSRF cookie/header. 401: sign in again. 503: backend/database availability. Never substitute a shared staff credential.
Stop if legacy data requires inferred patient identity, a change enables real calls/recordings, or a fix would restore unauthenticated access. Those changes exceed this milestone. Do not erase clinical data to make migration tests green.

## Rollout and rollback

Apply additive migrations before compatible application code in synthetic staging. Retain new tables, audit records and foreign keys. Roll back application code only to a compatible secure version; otherwise disable affected endpoints and fix forward. Never restore shared-token/unauthenticated call access. Down migrations are isolated-test tools, not the deployment rollback plan.

## Completion evidence and review

Record commands, actual outcomes, limitations and hosted CI separately in [FOUNDATION_EVIDENCE](../../FOUNDATION_EVIDENCE.md). Compare the tests above to the corresponding invariant, not just a green process exit. Follow [FOUNDATION_GUIDE](../../FOUNDATION_GUIDE.md) for operator commands and exact shared contracts.
Human review, staging deployment and later commercial release acceptance remain separate gates. Do not move this packet to accepted merely because local implementation is present.
