# DEC-003: Approve adult minor and guardian authority rules

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** B — Owner decisions · **Type:** Decision and approval

**Complexity:** Medium (planning band; estimate after reconnaissance)

**Depends on:** [DEC-002](DEC-002-approve-launch-country-languages-and-data-boundaries.md)

**Blocks:** [DEC-004](DEC-004-approve-clinic-hours-follow-up-and-safety-responsibilities.md), [PAT-001](PAT-001-build-canonical-staff-patient-management.md), [PAT-002](PAT-002-persist-guardian-relationships-and-enforce-authority.md), [INT-002](INT-002-complete-patient-and-guardian-access-expiry-and-resume.md), [GOV-001](GOV-001-define-and-implement-retention-access-and-deletion-policy.md)

**Operator/clinic action required:** Yes

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Approve adult minor and guardian authority rules. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

Adults and minors are in the agreed scope, but no authoritative guardian relationship or jurisdiction-specific authority policy is implemented.

Owner: clinic policy owner and appropriate legal/clinical reviewer.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

Adults and minors are in the agreed scope, but no authoritative guardian relationship or jurisdiction-specific authority policy is implemented.

This ticket closes the gap through: approve adult minor and guardian authority rules. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

Adults and minors are in the agreed scope, but no authoritative guardian relationship or jurisdiction-specific authority policy is implemented.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Owner: clinic policy owner and appropriate legal/clinical reviewer. Define authority scopes, evidence, expiry/revocation, shared-contact disclosure, confidential restrictions, disputed authority and age-transition handling. Contact possession alone proves neither identity nor guardianship. Retain app-owned staff roles admin/care_staff.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Owner: clinic policy owner and appropriate legal/clinical reviewer. Define authority scopes, evidence, expiry/revocation, shared-contact disclosure, confidential restrictions, disputed authority and age-transition handling. Contact possession alone proves neither identity nor guardianship. Retain app-owned staff roles admin/care_staff.

## 7. Facts, assumptions and unknowns

- **Fact:** Adults and minors are in the agreed scope, but no authoritative guardian relationship or jurisdiction-specific authority policy is implemented.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** DEC-002
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

Deliver approve adult minor and guardian authority rules and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `src/modules/intake/session-service.js`](../../../src/modules/intake/session-service.js)
- [Existing file: `docs/product-guide/06-security-privacy-and-safety.md`](../../../docs/product-guide/06-security-privacy-and-safety.md)

Proposed output paths (not present merely because this ticket exists):

- `docs/decisions/guardian-authority.md`

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

For this decision/evidence task, inspect prerequisite artifacts and their recorded commands/results. Do not reinstall dependencies, run migrations, make paid calls or alter a deployment merely to draft an approval record. For a release gate, execute the specifically approved acceptance matrix in isolated staging and attach its output.

## 13. Implementation phases

1. Confirm prerequisites and freeze the specific contract.
2. Implement the smallest coherent change or prepare the required decision artifact.
3. Exercise the ticket-specific failure and concurrency cases.
4. Review evidence, document rollback and hand off to blocked tickets.

## 14. Detailed step-by-step execution

### Step 1: Write adult/self, minor/guardian and disputed-authority journey matrices

**ACTION:** Write adult/self, minor/guardian and disputed-authority journey matrices.

**WHY:** The required outcome is: every read, consent and answer has an authorized respondent type.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Every read, consent and answer has an authorized respondent type. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Define how clinic staff verify and record authority

**ACTION:** Define how clinic staff verify and record authority.

**WHY:** The required outcome is: engineers do not invent legal age thresholds or identity evidence.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Engineers do not invent legal age thresholds or identity evidence. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Approve invitation/resume validity and disclosure limits per channel

**ACTION:** Approve invitation/resume validity and disclosure limits per channel.

**WHY:** The required outcome is: browser and telephone use the same authorization policy.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Browser and telephone use the same authorization policy. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Record revocation, multiple-guardian and age-transition decisions

**ACTION:** Record revocation, multiple-guardian and age-transition decisions.

**WHY:** The required outcome is: previously granted access has a deterministic end/review path.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Previously granted access has a deterministic end/review path. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: Every read, consent and answer has an authorized respondent type.
- [ ] Step 2: Engineers do not invent legal age thresholds or identity evidence.
- [ ] Step 3: Browser and telephone use the same authorization policy.
- [ ] Step 4: Previously granted access has a deterministic end/review path.

## 16. Error and failure semantics

If policy cannot distinguish who is speaking from who the patient is, block clinical activation and return to the owner.

Where an HTTP interface is changed, preserve safe structured errors and request IDs: malformed input400, invalid/expired authentication401, denied permission403, missing authorized resource404, revision/idempotency/state conflict409, oversized body413, persistent throttle429 with retry guidance, unavailable required persistence503. Do not return stack traces, secrets or clinical payload. Use the established resource-disclosure policy when choosing403 versus404. Decision gates fail as explicitly unresolved approvals, not invented successful API results.

## 17. Security considerations

Review direct-backend bypasses, forged actors, cross-record ownership, session revocation and sensitive output for any changed interface. Public intake/callback/provider routes must have their own explicit capability/signature/abuse contract. Browser mutations need CSRF/origin enforcement. Only approved minimal metadata may reach external notifications and logs.

## 18. Database and migration impact

This ticket does not by itself authorize a schema migration. Verify the schema/evidence supplied by prerequisite tickets and record unresolved compatibility issues in the decision or acceptance artifact.

## 19. External provider behavior

No provider account creation, paid call or clinical-data transfer is implied by writing this ticket. Where this ticket integrates a provider, require DEC-005 approval, scoped secrets, vendor-specific ingress verification, bounded timeout/retry behavior, durable receipt/reconciliation and explicit unknown-send handling. For tasks without external I/O, keep them independent of provider availability.

## 20. Logging and observability

Record safe request/job IDs, actor reference where authorized, operation/state, timing and error code. Never log passwords, bearer tokens, capability URLs, audio, transcript text or patient payload. Record operator/decision evidence without embedding secrets. A success metric must correspond to committed state or a genuinely approved artifact.

## 21. Detailed test specification

### TEST-DEC-003-01: Shared phone case

**Purpose:** Prove shared phone case under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Shared phone case` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Contact verification cannot merge identities or disclose another dependent. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** If policy cannot distinguish who is speaking from who the patient is, block clinical activation and return to the owner.

### TEST-DEC-003-02: Revoked/disputed guardian case

**Purpose:** Prove revoked/disputed guardian case under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Revoked/disputed guardian case` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Access and new outreach stop according to approved policy. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** If policy cannot distinguish who is speaking from who the patient is, block clinical activation and return to the owner.

### TEST-DEC-003-03: Age transition case

**Purpose:** Prove age transition case under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Age transition case` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Existing authority is reviewed using explicit policy, never an undocumented hard-coded age. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** If policy cannot distinguish who is speaking from who the patient is, block clinical activation and return to the owner.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

If policy cannot distinguish who is speaking from who the patient is, block clinical activation and return to the owner.

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

- [ ] Contact verification cannot merge identities or disclose another dependent.
- [ ] Access and new outreach stop according to approved policy.
- [ ] Existing authority is reviewed using explicit policy, never an undocumented hard-coded age.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Pause affected minor/guardian workflows while policy is corrected; preserve authority and consent history.

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

Notify the implementation owner of DEC-004, PAT-001, PAT-002, INT-002, GOV-001 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

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
