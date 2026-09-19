# SEC-005: Secure public intake capabilities and trusted provenance

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** A — Truth and security · **Type:** Engineering

**Complexity:** Medium (planning band; estimate after reconnaissance)

**Depends on:** [SEC-004](SEC-004-bound-requests-and-normalize-safe-errors-and-logs.md)

**Blocks:** [SEC-006](SEC-006-make-intake-drafts-submissions-and-review-atomic.md)

**Operator/clinic action required:** Only when deploying or exercising approved external services

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Secure public intake capabilities and trusted provenance. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

Public intake sessions have expiresAt:null; possession of identifiers drives resume/write operations, and field writes accept client source=staff.

Separate public identifiers from a32-byte random scoped capability stored hashed.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

Public intake sessions have expiresAt:null; possession of identifiers drives resume/write operations, and field writes accept client source=staff.

This ticket closes the gap through: secure public intake capabilities and trusted provenance. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

Public intake sessions have expiresAt:null; possession of identifiers drives resume/write operations, and field writes accept client source=staff.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Separate public identifiers from a32-byte random scoped capability stored hashed. Exchange an invitation secret for an HTTP-only session; strip it from visible URLs after exchange and set no-referrer. Synthetic draft lifetime defaults24h; clinical lifetime is approved by DEC-003 before INT-002 activation. Server context determines staff provenance. Bare public/internal IDs confer no access.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Separate public identifiers from a32-byte random scoped capability stored hashed. Exchange an invitation secret for an HTTP-only session; strip it from visible URLs after exchange and set no-referrer. Synthetic draft lifetime defaults24h; clinical lifetime is approved by DEC-003 before INT-002 activation. Server context determines staff provenance. Bare public/internal IDs confer no access.

## 7. Facts, assumptions and unknowns

- **Fact:** Public intake sessions have expiresAt:null; possession of identifiers drives resume/write operations, and field writes accept client source=staff.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** SEC-004
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

Deliver secure public intake capabilities and trusted provenance and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `src/modules/intake/routes.js`](../../../src/modules/intake/routes.js)
- [Existing file: `src/modules/intake/session-service.js`](../../../src/modules/intake/session-service.js)
- [Existing file: `src/modules/intake/session-store.js`](../../../src/modules/intake/session-store.js)
- [Existing file: `lib/intake-session.ts`](../../../lib/intake-session.ts)
- [Existing file: `lib/intake-links.ts`](../../../lib/intake-links.ts)
- [Existing file: `components/intake-session-share-card.tsx`](../../../components/intake-session-share-card.tsx)

Proposed output paths (not present merely because this ticket exists):

- `tests/intake-access.integration.test.cjs`

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

### Step 1: Map create/resume/field/submit/share consumers and token exposure points

**ACTION:** Map create/resume/field/submit/share consumers and token exposure points.

**WHY:** The required outcome is: every patient route is included, not just resume.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Every patient route is included, not just resume. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Add hashed expiring capability persistence and revocation

**ACTION:** Add hashed expiring capability persistence and revocation.

**WHY:** The required outcome is: no raw secret is stored or logged.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** No raw secret is stored or logged. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Gate all patient reads/writes and split staff-authorized provenance

**ACTION:** Gate all patient reads/writes and split staff-authorized provenance.

**WHY:** The required outcome is: source=staff from patient context is rejected before write.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** source=staff from patient context is rejected before write. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Update browser exchange/resume/expiry UX and disable insecure legacy access

**ACTION:** Update browser exchange/resume/expiry UX and disable insecure legacy access.

**WHY:** The required outcome is: old synthetic links expire deliberately; no silent live-data bypass.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Old synthetic links expire deliberately; no silent live-data bypass. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 5: Add bounded public creation and exchange throttling

**ACTION:** Add bounded public creation and exchange throttling.

**WHY:** The required outcome is: abuse failure cannot reveal an existing patient or session.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Abuse failure cannot reveal an existing patient or session. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: Every patient route is included, not just resume.
- [ ] Step 2: No raw secret is stored or logged.
- [ ] Step 3: source=staff from patient context is rejected before write.
- [ ] Step 4: Old synthetic links expire deliberately; no silent live-data bypass.
- [ ] Step 5: Abuse failure cannot reveal an existing patient or session.

## 16. Error and failure semantics

Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

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

### TEST-SEC-005-01: Cross-session identifier

**Purpose:** Prove cross-session identifier under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Cross-session identifier` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** A valid capability for draftA cannot read/change draftB; stateB is unchanged. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

### TEST-SEC-005-02: Expired/revoked capability

**Purpose:** Prove expired/revoked capability under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Expired/revoked capability` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** All resume/save/submit paths deny; no refresh extends expired authority. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

### TEST-SEC-005-03: Forged staff source

**Purpose:** Prove forged staff source under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Forged staff source` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** 400/403 and no staff-attributed field/audit event. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

### TEST-SEC-005-04: URL/log leakage

**Purpose:** Prove uRL/log leakage under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `URL/log leakage` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** After exchange the secret is absent from navigation URL, referrer and captured logs. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

Check every mutation and internal-ID fallback. Guarding only publicSessionId lookups leaves direct sessionId writes exposed.

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

- [ ] A valid capability for draftA cannot read/change draftB; stateB is unchanged.
- [ ] All resume/save/submit paths deny; no refresh extends expired authority.
- [ ] 400/403 and no staff-attributed field/audit event.
- [ ] After exchange the secret is absent from navigation URL, referrer and captured logs.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Expire affected capabilities and disable resume/mutations while fixing forward; do not restore identifier-only access.

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

Notify the implementation owner of SEC-006 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

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
