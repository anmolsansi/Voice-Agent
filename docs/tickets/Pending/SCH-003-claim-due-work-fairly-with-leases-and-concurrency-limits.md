# SCH-003: Claim due work fairly with leases and concurrency limits

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** C — Patient and scheduling data · **Type:** Engineering

**Complexity:** High (planning band; estimate after reconnaissance)

**Depends on:** [SCH-002](SCH-002-implement-scheduling-windows-recurrence-and-bounded-retries.md), [CNS-002](CNS-002-enforce-opt-out-immediately-before-every-dispatch.md)

**Blocks:** [TEL-001](TEL-001-define-provider-adapters-and-canonical-event-semantics.md), [UI-001](UI-001-replace-synthetic-operational-dashboards-with-persisted-views.md), [REL-001](REL-001-accept-the-complete-post-visit-check-in-release.md)

**Operator/clinic action required:** Only when deploying or exercising approved external services

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Claim due work fairly with leases and concurrency limits. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

listEligibleSchedules stops at200 rows. The foundation enqueue path has no complete durable multi-worker claim/lease or live dispatch reconciliation.

Use PostgreSQL FOR UPDATE SKIP LOCKED in bounded batches of50, ordered by eligible_at,id, with indexed state/time.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

listEligibleSchedules stops at200 rows. The foundation enqueue path has no complete durable multi-worker claim/lease or live dispatch reconciliation.

This ticket closes the gap through: claim due work fairly with leases and concurrency limits. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

listEligibleSchedules stops at200 rows. The foundation enqueue path has no complete durable multi-worker claim/lease or live dispatch reconciliation.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Use PostgreSQL FOR UPDATE SKIP LOCKED in bounded batches of50, ordered by eligible_at,id, with indexed state/time. Persist lease owner/token/expiry, attempts and next retry. Default lease60s with heartbeat20s; reclaim only after reconciling an uncertain external dispatch. Enforce20 aggregate active voice reservations per clinic transactionally and provider start-rate limits from DEC-005. Do not add Redis/Kafka.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Use PostgreSQL FOR UPDATE SKIP LOCKED in bounded batches of50, ordered by eligible_at,id, with indexed state/time. Persist lease owner/token/expiry, attempts and next retry. Default lease60s with heartbeat20s; reclaim only after reconciling an uncertain external dispatch. Enforce20 aggregate active voice reservations per clinic transactionally and provider start-rate limits from DEC-005. Do not add Redis/Kafka.

## 7. Facts, assumptions and unknowns

- **Fact:** listEligibleSchedules stops at200 rows. The foundation enqueue path has no complete durable multi-worker claim/lease or live dispatch reconciliation.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** SCH-002, CNS-002
- **Unknown:** Actual implementation effort and release date; do not divide total effort evenly by ticket count.
- **Decision ownership:** Engineering owns implementation contracts; clinic/legal owners approve clinical, guardian, market and service policy; operator owns deployment/recovery. Do not fill missing approvals with an engineering guess.

## 8. Security, data and reliability invariants

- Synthetic development and test data only; recordings remain disabled.
- Authentication/authorization is enforced at the backend; actor identity comes from the verified session or scoped machine context.
- Missing data and unavailable PostgreSQL are different results. Never supply synthetic records as operational fallback.
- A mandatory domain mutation and its audit event share a transaction. External network calls happen outside database locks.
- Phone numbers and names are not identity keys; patient/guardian association needs explicit verified evidence.
- Every invariant specific to this ticket is also an acceptance requirement in section 5.

## 9. Scope and exclusions

Deliver claim due work fairly with leases and concurrency limits and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `src/jobs/checkins.js`](../../../src/jobs/checkins.js)
- [Existing file: `src/modules/calls/store.js`](../../../src/modules/calls/store.js)
- [Existing file: `src/modules/calls/service.js`](../../../src/modules/calls/service.js)

Proposed output paths (not present merely because this ticket exists):

- `src/jobs/dispatch-worker.js`
- `tests/worker-leases.integration.test.cjs`

## 11. Pre-flight repository reconnaissance

1. Read applicable `AGENTS.md`, the master roadmap, this ticket and prerequisite completion records.
2. Use the codebase graph to locate entrypoints, callers and repositories. If the graph is unavailable or incomplete, record that fact and inspect source directly.
3. Confirm the current main commit, working-tree state, actual route registration, payload validation, transaction boundaries and relevant tests.
4. Record exact files/functions, existing constraints/indexes and caller compatibility in a short implementation note. Proposed interfaces must not be mistaken for already implemented routes.
5. Stop dependent implementation if a prerequisite is unaccepted or a required clinic/operator decision is missing; independent ready tickets may proceed.

## 12. Baseline commands and environment

Run read-only context checks first:

```sh
git status --short
git rev-parse HEAD
git diff --check
```

For code changes, install from the lockfile if needed and record a reproducible baseline. Use an explicitly disposable PostgreSQL test database; never aim test/reset commands at a clinic database.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run check:voice-agent
npm run build
```

Database changes also require `npm run test:integration` with `TEST_DATABASE_URL` set to the isolated database. Browser-facing changes require `npm run test:browser` using the existing Playwright configuration. Inspect command definitions before use. Record inherited failures separately; do not silently call a failed baseline passing.

## 13. Implementation phases

1. Confirm prerequisites and freeze the specific contract.
2. Implement the smallest coherent change or prepare the required decision artifact.
3. Exercise the ticket-specific failure and concurrency cases.
4. Review evidence, document rollback and hand off to blocked tickets.

## 14. Detailed step-by-step execution

### Step 1: Add durable work claim/reservation fields and indexes

**ACTION:** Add durable work claim/reservation fields and indexes.

**WHY:** The required outcome is: two workers cannot own the same live lease.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Two workers cannot own the same live lease. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Claim/commit a bounded batch before external calls

**ACTION:** Claim/commit a bounded batch before external calls.

**WHY:** The required outcome is: no database lock is held across network requests.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** No database lock is held across network requests. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Process subsequent due batches and advance completed work

**ACTION:** Process subsequent due batches and advance completed work.

**WHY:** The required outcome is: more than1000 records drain without the first200 starving later rows.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** More than1000 records drain without the first200 starving later rows. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Implement heartbeat/fencing and lease expiry recovery

**ACTION:** Implement heartbeat/fencing and lease expiry recovery.

**WHY:** The required outcome is: stale workers cannot finalize a newly claimed operation.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Stale workers cannot finalize a newly claimed operation. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 5: Enforce capacity/spend/eligibility before each dispatch

**ACTION:** Enforce capacity/spend/eligibility before each dispatch.

**WHY:** The required outcome is: scale limits remain effective across processes.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Scale limits remain effective across processes. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: Two workers cannot own the same live lease.
- [ ] Step 2: No database lock is held across network requests.
- [ ] Step 3: More than1000 records drain without the first200 starving later rows.
- [ ] Step 4: Stale workers cannot finalize a newly claimed operation.
- [ ] Step 5: Scale limits remain effective across processes.

## 16. Error and failure semantics

Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

Where an HTTP interface is changed, preserve safe structured errors and request IDs: malformed input400, invalid/expired authentication401, denied permission403, missing authorized resource404, revision/idempotency/state conflict409, oversized body413, persistent throttle429 with retry guidance, unavailable required persistence503. Do not return stack traces, secrets or clinical payload. Use the established resource-disclosure policy when choosing403 versus404. Decision gates fail as explicitly unresolved approvals, not invented successful API results.

## 17. Security considerations

Review direct-backend bypasses, forged actors, cross-record ownership, session revocation and sensitive output for any changed interface. Public intake/callback/provider routes must have their own explicit capability/signature/abuse contract. Browser mutations need CSRF/origin enforcement. Only approved minimal metadata may reach external notifications and logs.

## 18. Database and migration impact

Identify actual affected tables during reconnaissance. If a schema change is required, use a new additive migration after the existing history, with orphan diagnostics, constraints and indexes. Never rename either historical004 migration or infer patient links from phone/name. Prove fresh database and representative upgrade paths. Use transactional domain/audit writes, bounded locks and explicit uniqueness for concurrent identities; avoid network work while holding a transaction.

## 19. External provider behavior

No provider account creation, paid call or clinical-data transfer is implied by writing this ticket. Where this ticket integrates a provider, require DEC-005 approval, scoped secrets, vendor-specific ingress verification, bounded timeout/retry behavior, durable receipt/reconciliation and explicit unknown-send handling. For tasks without external I/O, keep them independent of provider availability.

## 20. Logging and observability

Record safe request/job IDs, actor reference where authorized, operation/state, timing and error code. Never log passwords, bearer tokens, capability URLs, audio, transcript text or patient payload. Record operator/decision evidence without embedding secrets. A success metric must correspond to committed state or a genuinely approved artifact.

## 21. Detailed test specification

### TEST-SCH-003-01: Two-worker race

**Purpose:** Prove two-worker race under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Two-worker race` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Exactly one claim/dispatch operation for each due item. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

### TEST-SCH-003-02: 1200 due records

**Purpose:** Prove 1200 due records under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `1200 due records` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Every eligible item is eventually evaluated with bounded batches and stable fairness. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

### TEST-SCH-003-03: Crash after claim

**Purpose:** Prove crash after claim under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Crash after claim` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Lease recovery works and uncertain provider acceptance is reconciled before retry. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

### TEST-SCH-003-04: Concurrency cap

**Purpose:** Prove concurrency cap under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Concurrency cap` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Competing claims never reserve more than20 active conversations. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

Lease expiry alone is not permission to redial. Inspect durable dispatch status and provider reconciliation first.

- Response succeeds but durable state is missing: inspect transaction commit and any memory fallback.
- State changes without audit: verify both writes use the same transaction client.
- Retry duplicates work: inspect the idempotency identity, unique index and unknown-send reconciliation.
- UI and database disagree: inspect canonical ownership, projection and cache invalidation.
- Tests pass but acceptance is absent: keep implementation evidence separate from clinic/operator approval.

## 24. PR evidence required

- Concrete before/after behavior and the final contract.
- Exact changed files, affected callers and migration compatibility where applicable.
- Each checkpoint and test ID with command/procedure, commit, environment and observed result.
- Local, hosted CI, browser and deployed results listed separately; unavailable evidence remains unavailable.
- Security/data exposure review, failure recovery and rollback limitations.
- Decisions and approvals linked with owners and dates; no invented sign-offs.

## 25. Acceptance criteria

- [ ] Exactly one claim/dispatch operation for each due item.
- [ ] Every eligible item is eventually evaluated with bounded batches and stable fairness.
- [ ] Lease recovery works and uncertain provider acceptance is reconciled before retry.
- [ ] Competing claims never reserve more than20 active conversations.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Stop new claims and drain/reconcile active operations; keep leases/receipts so restart cannot duplicate calls.

Retain additive structures unless a separately reviewed data-safe rollback exists. Never restore shared-token authorization, unauthenticated call APIs, disabled TLS verification or cached success during database failure. Preserve pending staff work and stop outbound activity if safe behavior cannot be established.

## 28. Forbidden shortcuts

- Marking this ticket done because this plan exists or a prototype renders.
- Bypassing an unresolved geography, guardian, clinic or vendor decision.
- Replacing required persistence or approval with fixtures, guessed identities or model output.
- Treating provider delivery as staff acknowledgment or unknown send as safe to resend.
- Moving unrelated source changes into this ticket to clear a test run.

## 29. Stop: needs architect or decision-owner input

Stop the affected work when the inspected schema/route contradicts this contract, a dependency is missing, a migration would discard data, patient/guardian authority is ambiguous, or a provider cannot meet approved data/region requirements. Record the exact conflict, evidence, smallest options, risks and recommended resolution. Continue only independent work that does not depend on the unresolved decision.

## 30. Handoff

Notify the implementation owner of TEL-001, UI-001, REL-001 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

## 31. Completion record

| Field | Value |
|---|---|
| Implementation/decision commit | Not completed |
| PR and review | Not completed |
| Local tests/checks | Not run for this ticket |
| Hosted CI | Not run for this ticket |
| Browser/staging/operator evidence | Not recorded |
| Clinic/legal/provider approval, if applicable | Not recorded |
| Rollback rehearsal | Not recorded |
| Completed by / date | Not completed |
| Remaining limitations | Resolve during execution; none are silently waived |
