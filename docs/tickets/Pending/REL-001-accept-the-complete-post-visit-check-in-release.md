# REL-001: Accept the complete post-visit check-in release

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** F — Operations and Release 1 · **Type:** Evidence and acceptance

**Complexity:** Medium (planning band; estimate after reconnaissance)

**Depends on:** [SEC-006](SEC-006-make-intake-drafts-submissions-and-review-atomic.md), [PAT-003](PAT-003-add-previewed-idempotent-patient-csv-import.md), [CNS-002](CNS-002-enforce-opt-out-immediately-before-every-dispatch.md), [SCH-003](SCH-003-claim-due-work-fairly-with-leases-and-concurrency-limits.md), [QA-003](QA-003-measure-load-and-failure-recovery-at-the-planning-scale.md), [UI-002](UI-002-complete-patient-and-call-review-screens.md), [RPT-001](RPT-001-replace-fixed-reports-and-make-exports-safe.md), [AUD-001](AUD-001-implement-authoritative-audit-review-and-coverage.md), [ADM-001](ADM-001-complete-staff-administration-and-clinic-settings.md), [GOV-001](GOV-001-define-and-implement-retention-access-and-deletion-policy.md), [GOV-002](GOV-002-prepare-clinic-onboarding-support-and-offboarding.md), [QA-004](QA-004-maintain-requirement-to-evidence-acceptance-matrix.md)

**Blocks:** [INT-001](INT-001-define-one-versioned-intake-contract-for-both-voice-channels.md)

**Operator/clinic action required:** Yes

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Accept the complete post-visit check-in release. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

Foundation code is merged; no buyer-approved complete post-visit product or clinical deployment acceptance exists.

Release1 requires patient setup/import, guardian authority, consent/opt-out, scheduling, fixed approved script, real voice, durable callback work, staff acknowledgment/resolution, persisted reporting/audit, secure administration, monitoring, backup/restore and support.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

Foundation code is merged; no buyer-approved complete post-visit product or clinical deployment acceptance exists.

This ticket closes the gap through: accept the complete post-visit check-in release. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

Foundation code is merged; no buyer-approved complete post-visit product or clinical deployment acceptance exists.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Release1 requires patient setup/import, guardian authority, consent/opt-out, scheduling, fixed approved script, real voice, durable callback work, staff acknowledgment/resolution, persisted reporting/audit, secure administration, monitoring, backup/restore and support. No incomplete in-scope feature is relabeled a later release. Commercial acceptance requires a named buyer and signed scope; prototype evidence stays separate.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Release1 requires patient setup/import, guardian authority, consent/opt-out, scheduling, fixed approved script, real voice, durable callback work, staff acknowledgment/resolution, persisted reporting/audit, secure administration, monitoring, backup/restore and support. No incomplete in-scope feature is relabeled a later release. Commercial acceptance requires a named buyer and signed scope; prototype evidence stays separate.

## 7. Facts, assumptions and unknowns

- **Fact:** Foundation code is merged; no buyer-approved complete post-visit product or clinical deployment acceptance exists.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** SEC-006, PAT-003, CNS-002, SCH-003, QA-003, UI-002, RPT-001, AUD-001, ADM-001, GOV-001, GOV-002, QA-004
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

Deliver accept the complete post-visit check-in release and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `docs/FOUNDATION_EVIDENCE.md`](../../../docs/FOUNDATION_EVIDENCE.md)
- [Existing file: `docs/pilot-smoke-checklist.md`](../../../docs/pilot-smoke-checklist.md)

Proposed output paths (not present merely because this ticket exists):

- `docs/releases/RELEASE_1_ACCEPTANCE.md`

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

### Step 1: Freeze buyer scope and map every requirement to QA-004 evidence

**ACTION:** Freeze buyer scope and map every requirement to QA-004 evidence.

**WHY:** The required outcome is: no mandatory row has an unknown owner or deferred feature.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** No mandatory row has an unknown owner or deferred feature. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Run complete synthetic staging journeys and failure rehearsals

**ACTION:** Run complete synthetic staging journeys and failure rehearsals.

**WHY:** The required outcome is: patient-to-report workflow survives failures.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Patient-to-report workflow survives failures. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Resolve security/clinical/operational blockers and approve bounded pilot

**ACTION:** Resolve security/clinical/operational blockers and approve bounded pilot.

**WHY:** The required outcome is: decision owners explicitly authorize data and provider use.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Decision owners explicitly authorize data and provider use. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Capture acceptance, deployment artifact and rollback ownership

**ACTION:** Capture acceptance, deployment artifact and rollback ownership.

**WHY:** The required outcome is: release status is independently reviewable.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Release status is independently reviewable. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: No mandatory row has an unknown owner or deferred feature.
- [ ] Step 2: Patient-to-report workflow survives failures.
- [ ] Step 3: Decision owners explicitly authorize data and provider use.
- [ ] Step 4: Release status is independently reviewable.

## 16. Error and failure semantics

A passing call demo cannot substitute for missing scheduling, follow-up, reporting or recovery evidence.

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

### TEST-REL-001-01: End-to-end post-visit

**Purpose:** Prove end-to-end post-visit under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `End-to-end post-visit` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Consent to completed answer to callback resolution appears in persisted reports/audit. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A passing call demo cannot substitute for missing scheduling, follow-up, reporting or recovery evidence.

### TEST-REL-001-02: Opt-out race

**Purpose:** Prove opt-out race under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Opt-out race` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** No new dispatch after suppression takes effect. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A passing call demo cannot substitute for missing scheduling, follow-up, reporting or recovery evidence.

### TEST-REL-001-03: Gate audit

**Purpose:** Prove gate audit under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Gate audit` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** All scoped acceptance evidence is passing and current; absent buyer signature blocks commercial completion. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A passing call demo cannot substitute for missing scheduling, follow-up, reporting or recovery evidence.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

A passing call demo cannot substitute for missing scheduling, follow-up, reporting or recovery evidence.

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

- [ ] Consent to completed answer to callback resolution appears in persisted reports/audit.
- [ ] No new dispatch after suppression takes effect.
- [ ] All scoped acceptance evidence is passing and current; absent buyer signature blocks commercial completion.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Pause new outreach and preserve staff work and secure read access; restore only a compatible secure artifact.

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

Notify the implementation owner of INT-001 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

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
