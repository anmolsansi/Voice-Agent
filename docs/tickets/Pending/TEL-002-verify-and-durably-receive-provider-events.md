# TEL-002: Verify and durably receive provider events

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** D — Telephony and controlled call · **Type:** Engineering

**Complexity:** High (planning band; estimate after reconnaissance)

**Depends on:** [DATA-003](DATA-003-add-explicit-inbound-and-dispatch-identity-relationships.md)

**Blocks:** [TEL-003](TEL-003-dispatch-cancel-and-reconcile-uncertain-provider-outcomes.md), [CBK-003](CBK-003-deliver-telephone-callback-request-capture.md)

**Operator/clinic action required:** Only when deploying or exercising approved external services

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Verify and durably receive provider events. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

There is no production vendor-authenticated ingress feeding the persisted attempt lifecycle.

Proposed POST /api/telephony/webhooks/:provider is explicitly provider-authenticated, not staff-cookie authenticated.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

There is no production vendor-authenticated ingress feeding the persisted attempt lifecycle.

This ticket closes the gap through: verify and durably receive provider events. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

There is no production vendor-authenticated ingress feeding the persisted attempt lifecycle.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Proposed POST /api/telephony/webhooks/:provider is explicitly provider-authenticated, not staff-cookie authenticated. Verify selected vendor signature against raw bytes and canonical external URL, then durably insert an event receipt before2xx. Unique provider/account/event identity deduplicates. A worker applies normalized lifecycle and its audit atomically. Retain minimum redacted event metadata under GOV-001, not unlimited raw payloads.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Proposed POST /api/telephony/webhooks/:provider is explicitly provider-authenticated, not staff-cookie authenticated. Verify selected vendor signature against raw bytes and canonical external URL, then durably insert an event receipt before2xx. Unique provider/account/event identity deduplicates. A worker applies normalized lifecycle and its audit atomically. Retain minimum redacted event metadata under GOV-001, not unlimited raw payloads.

## 7. Facts, assumptions and unknowns

- **Fact:** There is no production vendor-authenticated ingress feeding the persisted attempt lifecycle.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** DATA-003
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

Deliver verify and durably receive provider events and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `src/app.js`](../../../src/app.js)
- [Existing file: `src/http/request.js`](../../../src/http/request.js)
- [Existing file: `src/modules/calls/service.js`](../../../src/modules/calls/service.js)
- [Existing file: `src/voice/provider/webhooks.mjs`](../../../src/voice/provider/webhooks.mjs)

Proposed output paths (not present merely because this ticket exists):

- `src/modules/telephony/routes.js`
- `src/modules/telephony/event-store.js`
- `tests/provider-ingress.integration.test.cjs`

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

### Step 1: Configure trusted external URL and vendor signature verifier

**ACTION:** Configure trusted external URL and vendor signature verifier.

**WHY:** The required outcome is: proxy rewriting cannot silently invalidate or bypass verification.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Proxy rewriting cannot silently invalidate or bypass verification. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Bound raw body and verify before parsing/trusted lookup

**ACTION:** Bound raw body and verify before parsing/trusted lookup.

**WHY:** The required outcome is: tampered requests cause zero receipt/domain writes.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Tampered requests cause zero receipt/domain writes. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Insert idempotent receipt then acknowledge

**ACTION:** Insert idempotent receipt then acknowledge.

**WHY:** The required outcome is: crash after2xx still leaves recoverable work.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Crash after2xx still leaves recoverable work. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Process receipt/status/audit transactionally and mark failures for retry/review

**ACTION:** Process receipt/status/audit transactionally and mark failures for retry/review.

**WHY:** The required outcome is: poison events cannot wedge all later events.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Poison events cannot wedge all later events. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: Proxy rewriting cannot silently invalidate or bypass verification.
- [ ] Step 2: Tampered requests cause zero receipt/domain writes.
- [ ] Step 3: Crash after2xx still leaves recoverable work.
- [ ] Step 4: Poison events cannot wedge all later events.

## 16. Error and failure semantics

Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

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

### TEST-TEL-002-01: Tampered signature/body/URL

**Purpose:** Prove tampered signature/body/URL under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Tampered signature/body/URL` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Denied and domain/audit state unchanged. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

### TEST-TEL-002-02: Duplicate valid event

**Purpose:** Prove duplicate valid event under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Duplicate valid event` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** One receipt and one semantic lifecycle effect. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

### TEST-TEL-002-03: Crash after receipt

**Purpose:** Prove crash after receipt under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Crash after receipt` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Restart completes processing without provider redelivery dependence. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

### TEST-TEL-002-04: Database unavailable

**Purpose:** Prove database unavailable under the target contract.

**Level:** Choose the lowest meaningful layer; use real PostgreSQL for persistence/concurrency and a rendered browser for UI behavior.

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Database unavailable` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Non2xx; no fabricated durable receipt. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

Compare raw request and externally signed URL. Parsing/re-serializing first can invalidate signatures.

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

- [ ] Denied and domain/audit state unchanged.
- [ ] One receipt and one semantic lifecycle effect.
- [ ] Restart completes processing without provider redelivery dependence.
- [ ] Non2xx; no fabricated durable receipt.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Pause receipt processing while retaining the verified inbox; reject new ingress safely if persistence cannot be guaranteed.

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

Notify the implementation owner of TEL-003, CBK-003 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

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
