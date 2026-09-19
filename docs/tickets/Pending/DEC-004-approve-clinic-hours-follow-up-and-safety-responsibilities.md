# DEC-004: Approve clinic-hours follow-up and safety responsibilities

**Status: Pending — Not completed**

**Priority:** P0 · **Area:** B — Owner decisions · **Type:** Decision and approval

**Complexity:** Medium (planning band; estimate after reconnaissance)

**Depends on:** [DEC-001](DEC-001-agree-a-clinic-buyer-scope-and-acceptance-contract.md), [DEC-003](DEC-003-approve-adult-minor-and-guardian-authority-rules.md)

**Blocks:** [DEC-005](DEC-005-select-vendors-hosting-and-a-bounded-spending-model.md), [SCH-001](SCH-001-model-post-visit-occurrences-and-immutable-script-versions.md), [SCH-002](SCH-002-implement-scheduling-windows-recurrence-and-bounded-retries.md), [VOI-002](VOI-002-implement-approved-fixed-script-conversation-behavior.md), [WRK-001](WRK-001-persist-one-shared-follow-up-work-item-lifecycle.md), [WRK-003](WRK-003-route-overdue-work-using-clinic-hours-policy.md), [ADM-001](ADM-001-complete-staff-administration-and-clinic-settings.md)

**Operator/clinic action required:** Yes

**Baseline:** main `377b3e6a4238533a623efc21a56ae65669843b45`, inspected 2026-09-19.

[Master roadmap and shared contracts](../../PROJECT_COMPLETION_GUIDE.md). This file is an execution plan, not evidence that its work has been performed.

## 1. Objective

Approve clinic-hours follow-up and safety responsibilities. The finished outcome is defined by the contract and observable assertions below.

## 2. Junior engineer mental model

Clinic-hours follow-up is selected. Prototype phrase rules and fixture escalation owners do not constitute a staffed service policy.

Owner: clinic clinical/operations lead.

Think in three parts: the authoritative input, the durable state or approved decision it may change, and the evidence that proves the result. A screen, provider acknowledgment or unchecked document alone cannot prove all three.

## 3. Why this ticket exists

Clinic-hours follow-up is selected. Prototype phrase rules and fixture escalation owners do not constitute a staffed service policy.

This ticket closes the gap through: approve clinic-hours follow-up and safety responsibilities. Its downstream dependents must not assume the target behavior exists before the completion evidence is recorded.

## 4. Current behavior and evidence boundary

Clinic-hours follow-up is selected. Prototype phrase rules and fixture escalation owners do not constitute a staffed service policy.

The paths below are reconnaissance entry points from the repository audit. Directories identify an audited subsystem, not a claim that every contained file was inspected. Re-read exact handlers, repositories and tests at the implementation commit; record those paths in the PR. Proposed paths are explicitly separate.

## 5. Target behavior and contract

Owner: clinic clinical/operations lead. Approve exact script/disclosures, hours/holidays, time-based acknowledgment targets, urgent-signal handling, after-hours wording and unreachable-staff action. No promise of emergency dispatch or24/7 monitoring. Application code enforces allowed actions; AI cannot choose clinical treatment.

## 6. Architecture discussion and decisions

Retain Next.js as the browser-facing layer, Node as permission/domain authority and PostgreSQL as durable authority. Keep one application/database deployment per clinic. Use existing domain services before introducing another representation. New provider or AI behavior cannot own authorization, identity association, consent, lifecycle transitions or irreversible writes.

Ticket-specific boundary: Owner: clinic clinical/operations lead. Approve exact script/disclosures, hours/holidays, time-based acknowledgment targets, urgent-signal handling, after-hours wording and unreachable-staff action. No promise of emergency dispatch or24/7 monitoring. Application code enforces allowed actions; AI cannot choose clinical treatment.

## 7. Facts, assumptions and unknowns

- **Fact:** Clinic-hours follow-up is selected. Prototype phrase rules and fixture escalation owners do not constitute a staffed service policy.
- **Assumption:** The merged foundation remains the starting point; verify branch drift before editing.
- **Required prerequisite evidence:** DEC-001, DEC-003
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

Deliver approve clinic-hours follow-up and safety responsibilities and the exact tests/checkpoints below. Modify adjacent shared contracts only when required, with affected-ticket coordination.

Do not implement unrelated releases, redesign tenancy, add an EHR/payment integration, enable recordings, build a general care-program builder, or add a distributed queue framework. Publication of this plan does not authorize live patient outreach.

## 10. Required reading and files

- [Existing file: `src/voice/scripts/check-in-script.mjs`](../../../src/voice/scripts/check-in-script.mjs)
- [Existing file: `src/voice/guardrails/safety-guardrails.mjs`](../../../src/voice/guardrails/safety-guardrails.mjs)
- [Existing file: `docs/conversation-design.md`](../../../docs/conversation-design.md)

Proposed output paths (not present merely because this ticket exists):

- `docs/decisions/followup-safety-policy.md`

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

### Step 1: Name primary and backup staff responsibility and hours

**ACTION:** Name primary and backup staff responsibility and hours.

**WHY:** The required outcome is: every work priority has a human owner and clock definition.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Every work priority has a human owner and clock definition. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 2: Approve post-visit question version and urgent/unsupported-question wording

**ACTION:** Approve post-visit question version and urgent/unsupported-question wording.

**WHY:** The required outcome is: synthetic prompts are not silently promoted to clinical scripts.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Synthetic prompts are not silently promoted to clinical scripts. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 3: Define acknowledgment deadlines, overdue escalation and after-hours receipts

**ACTION:** Define acknowledgment deadlines, overdue escalation and after-hours receipts.

**WHY:** The required outcome is: intake of a request is not represented as staff acknowledgment.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Intake of a request is not represented as staff acknowledgment. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

### Step 4: Run tabletop wrong-person, urgent phrase and absent-staff scenarios

**ACTION:** Run tabletop wrong-person, urgent phrase and absent-staff scenarios.

**WHY:** The required outcome is: each scenario has an approved action and patient-facing statement.. Without this checkpoint, the next step cannot safely rely on the result.

**VERIFY:** Each scenario has an approved action and patient-facing statement. Capture the relevant response/state diff, decision artifact or test output with the commit/environment; redact sensitive values.

**IF IT FAILS:** Stop dependent work, inspect the failure guide below and correct the cause. Keep the failed result in the evidence record rather than replacing it with an assumed pass.

## 15. Progress checkpoints

- [ ] Step 1: Every work priority has a human owner and clock definition.
- [ ] Step 2: Synthetic prompts are not silently promoted to clinical scripts.
- [ ] Step 3: Intake of a request is not represented as staff acknowledgment.
- [ ] Step 4: Each scenario has an approved action and patient-facing statement.

## 16. Error and failure semantics

A notification destination without an accountable person is not coverage. Keep rollout blocked until responsibility is accepted.

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

### TEST-DEC-004-01: Closed-clinic scenario

**Purpose:** Prove closed-clinic scenario under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Closed-clinic scenario` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** The system explains availability and approved urgent guidance without promising monitoring. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A notification destination without an accountable person is not coverage. Keep rollout blocked until responsibility is accepted.

### TEST-DEC-004-02: Unacknowledged urgent work

**Purpose:** Prove unacknowledged urgent work under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Unacknowledged urgent work` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Named fallback and escalation deadline are explicit. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A notification destination without an accountable person is not coverage. Keep rollout blocked until responsibility is accepted.

### TEST-DEC-004-03: Unsupported medical question

**Purpose:** Prove unsupported medical question under the target contract.

**Level:** Artifact/approval review and observed acceptance exercise

**Setup:** Use a clean synthetic fixture or isolated approval record. Establish the required prerequisite states, user/role, current revision and persisted baseline. For negative cases, seed the contrary permission/expiry/outage state explicitly; never change a real clinic record.

**Action:** Exercise `Unsupported medical question` through the actual changed entrypoint. Where the scenario names concurrency, issue competing requests together; where it names restart/outage, interrupt and restore the relevant dependency rather than mocking a successful response.

**Expected assertions:** Approved refusal/human path; no autonomous diagnosis or medication instruction. Assert the response or artifact, durable state and audit/side effects separately.

**Why it matters:** This assertion is the boundary that distinguishes the intended outcome from a plausible but incomplete success.

**Failure interpretation:** A notification destination without an accountable person is not coverage. Keep rollout blocked until responsibility is accepted.

## 22. Manual verification

Use a named synthetic record and the actual target surface. Follow the steps in section14 in order; capture before/after IDs and visible outcome. Exercise one authorized success and the highest-risk failure from section21. For UI, include keyboard access, small-screen layout, loading, empty and error states. For operator work, have a second operator follow the runbook without hidden local knowledge. For decisions, obtain the named owner’s dated approval and unresolved conditions.

## 23. Failure diagnosis guide

A notification destination without an accountable person is not coverage. Keep rollout blocked until responsibility is accepted.

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

- [ ] The system explains availability and approved urgent guidance without promising monitoring.
- [ ] Named fallback and escalation deadline are explicit.
- [ ] Approved refusal/human path; no autonomous diagnosis or medication instruction.

## 26. Definition of done

- [ ] Prerequisites accepted and ticket-specific contract implemented or decision approved.
- [ ] Every step/checkpoint and applicable test above passes with recorded evidence.
- [ ] Relevant regression suite passes; inherited failures and accepted exceptions are explicit.
- [ ] No new authorization bypass, unsupported data association or silent persistence fallback.
- [ ] Documentation, operations and dependent contracts updated to actual behavior.
- [ ] Review complete; release/operator acceptance captured where this ticket requires it.
- [ ] Completion record filled, then move this ticket to Completed and update incoming links/inventory. A merge alone does not satisfy an unmet acceptance criterion.

## 27. Rollback plan

Disable autonomous outreach or the affected script and retain durable work for staff; do not downgrade priority to conceal missing coverage.

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

Notify the implementation owner of DEC-005, SCH-001, SCH-002, VOI-002, WRK-001, WRK-003, ADM-001 using the agreed project workflow after evidence review. This document does not itself authorize external messages, issue creation, merge or deployment. Update linked contract versions and note any remaining limitations.

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
