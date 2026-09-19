# CheckIn Care: current status and complete implementation roadmap

**Updated:** 2026-09-19. **Document status:** saved plan; implementation has not begun for the 59 new tickets below.

The foundation is implemented and merged. The complete product is **not complete**. This guide separates the existing foundation from remaining security repair, real workflows, operating controls and three commercial releases. Saving or publishing these files does not deploy the application or make any pending feature work.

## Navigation

- [Current status](#current-status)
- [What remains missing](#what-remains-missing)
- [Fixed scope and open decisions](#fixed-scope-and-open-decisions)
- [Architecture and shared contracts](#architecture-and-shared-contracts)
- [Step-by-step execution guide](#step-by-step-execution-guide)
- [Complete ticket inventory](#complete-ticket-inventory)
- [Provider and cost decision](#provider-and-cost-decision)
- [Release acceptance and rollback](#release-acceptance-and-rollback)
- [Evidence and maintenance](#evidence-and-maintenance)

## Current status

Repository: [anmolsansi/Voice-Agent](https://github.com/anmolsansi/Voice-Agent). Audited baseline: main `377b3e6a4238533a623efc21a56ae65669843b45`.

[Foundation PR34](https://github.com/anmolsansi/Voice-Agent/pull/34) was merged on 2026-09-18. [Main CI run35313332251](https://github.com/anmolsansi/Voice-Agent/actions/runs/35313332251) passed. These are foundation implementation/verification facts, not evidence of clinical deployment. Tracking [issue33](https://github.com/anmolsansi/Voice-Agent/issues/33) remained open at inspection. No submitted GitHub reviews were returned by the review query; that does not prove no review occurred elsewhere.

| Area | Status | Evidence and limit |
|---|---|---|
| Original 50 foundation microtasks | Completed in the existing implementation checklist | [Foundation progress](FOUNDATION_PROGRESS.md); verify ticket-level acceptance separately |
| Individual staff identity, sessions and permissions | Completed foundation implementation | Persisted users/sessions, password handling, revocation and backend enforcement; new security work remains |
| Canonical patients/schedules/attempt/detail linkage | Completed foundation implementation | Additive migrations, constrained linkage and PostgreSQL authority |
| Lifecycle/idempotency/audit concurrency | Completed foundation implementation | Foundation integration coverage; production dispatch is not delivered |
| Public form → submit → staff review → PDF baseline | Completed baseline verification | Three recorded browser scenarios; intake integrity gaps below still require repair |
| Original ten ticket acceptance records | Not completed as an acceptance reconciliation exercise | Packets remain in Pending; do not silently mark/move them based only on merge |
| Real telephony and complete post-visit workflow | Not completed | Provider remains simulated; no controlled-call acceptance |
| Browser microphone + telephone intake | Not completed | Existing form/PDF is a foundation, not both voice channels |
| Standalone callbacks through web/phone/staff | Not completed | Requires independent capture, work handling and reporting |
| Buyer-approved scope, geography and clinical policy | Not completed | Named clinic decision owners and approvals required |
| Synthetic staging / production deployment | Not completed | No confirmed environment or operator acceptance |
| Commercial Release1 / Release2 / Release3 | Not completed | Separate complete acceptance gates below |

Recorded foundation verification: **17 ordinary tests,23 PostgreSQL integration tests,3 browser scenarios**, plus fixture checks, lint, typecheck and build. These counts come from [the foundation evidence](FOUNDATION_EVIDENCE.md), not a new functional run for this documentation change. The older22-test baseline used different grouping. Temporary `/tmp` logs named in the old record may not be durable; preserve hosted evidence and re-run relevant checks during implementation.

The old evidence document still says draft/unmerged and some older product documents propose shared tenancy or a builder. Those historical statements are superseded by this guide's dated status and agreed scope. DOC-001 reconciles every remaining statement and ticket-specific acceptance requirement; preserve history rather than deleting contrary evidence.

### Existing foundation packet ledger

The following original IDs are preserved. Their code is merged, but the new roadmap does not silently certify every review/operational condition in each packet.

| Existing packet | Implementation | Remaining handling |
|---|---|---|
| [FOUND-001](tickets/Pending/FOUND-001.md) | Completed baseline implementation | Reconcile dated context and acceptance evidence |
| [AUTH-001](tickets/Pending/AUTH-001.md) | Completed account persistence | Carry forward account/bootstrap evidence |
| [AUTH-002](tickets/Pending/AUTH-002.md) | Completed sessions/throttling | Recheck deployed proxy/resource behavior in new security tickets |
| [AUTH-003](tickets/Pending/AUTH-003.md) | Completed staff lifecycle | Preserve last-admin/recovery proof |
| [AUTH-004](tickets/Pending/AUTH-004.md) | Completed enforcement | Recheck upgraded browser/backend boundary |
| [DATA-001](tickets/Pending/DATA-001.md) | Completed canonical linkage | New inbound-purpose schema is separate DATA-003 |
| [CALL-001](tickets/Pending/CALL-001.md) | Completed route/payload repair | Provider ingress remains new work |
| [CALL-002](tickets/Pending/CALL-002.md) | Completed state/concurrency | Extend dispatch/reconciliation without weakening invariants |
| [DATA-002](tickets/Pending/DATA-002.md) | Completed persistence truth | Preserve fail-closed behavior in all new paths |
| [QA-001](tickets/Pending/QA-001.md) | Completed foundation automation/evidence | Reconcile review and deployed acceptance separately |

## What remains missing

These are findings from the audited source, not a claim that every feature absence can be inferred from an old roadmap.

| Finding | Why it blocks completion | Owning new tickets |
|---|---|---|
| Dependency audit reports14 findings:1critical,9high,2moderate,2low; Next14.2.30 installed | Passing tests do not remediate vulnerable dependencies | SEC-001 |
| PostgreSQL TLS factory uses `rejectUnauthorized:false`; explicit connection/query bounds absent | Network encryption without identity verification and unbounded waits are inadequate | SEC-002 |
| Per-IP throttling depends on correct proxy/source identity; scrypt uses substantial memory | A proxy can collapse all users into one source; concurrent hashing can exhaust a small VM | SEC-003, AUTH-005 |
| Public request limits and failure paths need systematic coverage | Oversized/malformed input must not exhaust resources or leak internal errors | SEC-004 |
| Intake session creation uses `expiresAt:null` | Possession-based access needs expiry, revocation and disclosure control | SEC-005, INT-002 |
| Intake field writes accept `source=staff`; drafts use read/modify/write JSON | Clients may forge provenance and concurrent changes can be lost | SEC-006 |
| Submission and snapshot persistence are separate; upsert can replace prior snapshot; later field writes remain possible | A submitted clinical record must be immutable and transactionally created | SEC-006, INT-006 |
| No complete verified patient/guardian/import/consent workflow | Names/numbers cannot establish identity or guardian authority | PAT-001..003, CNS-001..002 |
| Scheduler eligibility only reads first200 without a complete advancement/lease contract | Larger or competing workloads can starve, duplicate or exceed capacity | SCH-001..003 |
| Provider sandbox uses fake call IDs, a `+1` assumption and generic HMAC | Real vendor signatures, regions, number formats and uncertain delivery need contracts | TEL-001..003 |
| Every current attempt requires patient/schedule | Unknown inbound callers cannot be modeled safely by fabricated patients/schedules | DATA-003 |
| No completed media/conversation/answer pipeline; extraction confidence is hardcoded | Voice must respect verified identity, fixed scripts, uncertainty and durable confirmation | VOI-001..003 |
| Late transcript readiness has no complete terminal enrichment workflow | Completed lifecycle must not be reopened to attach late metadata | VOI-003 |
| Callback/overdue work and operational screens are incomplete | A completed call is not a completed clinical follow-up service | WRK-001..003, UI-001..002 |
| Reports use fixtures/fixed clock and caller `requestedBy`; CSV needs formula safety | Operational reporting must reflect durable facts and authenticated actor | RPT-001 |
| Audit API returns501 | Stored authoritative events need authorized review/coverage | AUD-001 |
| No measured deployment, backup restore, monitoring or capacity | CI success does not prove a recoverable clinic service | OPS-001..004, QA-003 |
| Geography, language, buyer scope, guardian policy, vendors and ownership undecided | Clinical data and real outreach cannot proceed on guessed decisions | DEC-001..005, GOV-001..002 |

Inspected entry points include [server](../src/server.js), [PostgreSQL adapter](../src/lib/db/postgres.js), [modules](../src/modules), [jobs](../src/jobs), [services](../src/services), [browser application](../app), [migrations](../db/migrations), [package manifest](../package.json) and [existing tests](../tests). Ticket packets distinguish existing paths from proposed outputs. Recheck exact functions/routes against the implementation commit before editing.

## Fixed scope and open decisions

### Agreed product and engineering boundaries

- One separate application/database deployment per clinic; no shared multi-tenant redesign.
- App-owned staff accounts with `admin` and `care_staff`; no shared access token or public staff registration.
- Adults and minors are in scope, with explicit guardian identity, authorization, consent and disclosure rules.
- Manual entry and CSV import first; no EHR/payment integration in these releases.
- Synthetic development/test records only; recordings disabled.
- Fixed versioned approved scripts first; no general care-program builder or unconstrained clinical agent.
- Follow-up operates during agreed clinic hours. No promise of24/7 monitoring or emergency dispatch.
- Release1 includes the callback queue needed by post-visit check-ins. It cannot be deferred to Release3.
- Release2 includes **both browser microphone and telephone intake**, patient review/submission, resume, staff review and PDF.
- Release3 includes **web, telephone and staff-entered** standalone callbacks independent of check-ins.
- Planning scale:1000 total attempts/day including retries,20 concurrent voice conversations and50 staff per clinic. These are unproven targets.
- Lowest fixed-cost viable VM is preferred. It still needs patching, access control, off-host backups, monitoring and a named operator.
- Estimate costs before choosing a budget; no approved spending cap has been supplied.
- Finish and accept each commercial release separately; an attractive prototype remains labeled a prototype.

### Decisions that need named owners

| Decision | Owner to appoint | Evidence needed | Blocks |
|---|---|---|---|
| Buyer and exact Release1 scope | Clinic sponsor + product owner | Accepted workflows, exclusions and success criteria | DEC-001 and commercial acceptance |
| Geography and supported language | Clinic sponsor + qualified policy/legal owner | Intended clinic/patient jurisdictions and approved languages | DEC-002; provider/data choices |
| Adult/minor/guardian assurance | Clinic policy/legal owner | Verification, authority, consent, confidentiality and revocation policy | DEC-003; disclosure and real intake |
| Clinical script and urgent/follow-up handling | Named clinical lead + staff manager | Approved wording, staffed hours, backup responsibility, no-emergency-service disclosure | DEC-004; conversations and staff deadlines |
| Provider/hosting/data processing and cost | Engineering + operator + clinic decision owner | Region, terms, data handling, limits, cost model and approval | DEC-005; live provider work |
| Retention, export, deletion and holds | Clinic data owner + qualified policy/legal owner | Approved category-specific lifecycle | GOV-001; real-data operation |

These decisions do not block independent foundation security repair. They do block implementation that would silently encode unresolved policy and any real patient deployment.

## Architecture and shared contracts

### Ownership and authority

| Domain | Authoritative owner | Contract |
|---|---|---|
| Staff identity/session | Existing backend and PostgreSQL staff tables | Active user/session checked on each protected request; browser is not authority |
| Patient and guardian | Durable patient plus explicit guardian association | Contact details never imply identity or authority |
| Consent and suppression | Versioned consent and suppression records | Recheck dispatch eligibility immediately before provider side effect |
| Schedule and occurrence | Durable schedule and unique due occurrence | Clinic timezone, script version and due identity fixed explicitly |
| Attempt lifecycle | `call_attempts` | Centrally enforced transition table and atomic audit |
| Supplementary call detail | `calls`, unique attempt relationship | Detail enrichment cannot independently change lifecycle |
| Dispatch operation | Proposed durable outbound operation | Tracks prepared/sending/accepted/rejected/unknown/reconciled separately from call lifecycle |
| Provider receipt | Proposed verified durable inbox | Receipt committed before successful acknowledgment; replay idempotent |
| Answers/transcript | Linked detail with provenance and version | Deterministic validation and explicit confirmation; late enrichment does not reopen state |
| Staff follow-up | Durable work item and delivery attempts | Assignment, acknowledgment, notification delivery and resolution are distinct |
| Intake | Versioned draft plus immutable submission/amendment | Expected revision on edits; atomic snapshot submission |
| Standalone callback | Independent request linked to staff work | May begin as unverified contact; no fabricated attempt/patient |
| Audit | `audit_logs` | Mandatory event commits atomically with mutation; historical detail audit stays historical |

Proposed table and route names in tickets are design targets. Inspect actual code and allocate the next unused additive migration at implementation time. Do not treat these documents as an applied database schema.

### Identity and request boundary

Keep HTTP-only browser cookies, deployed HTTPS, CSRF/origin checks and backend session validation. Existing sessions have12-hour absolute and30-minute idle expiry. Existing persistent login limits are five failed attempts/account and50/source IP in15minutes; validate proxy trust before relying on the IP counter. Existing scrypt uses `N=131072,r=8,p=1,maxmem=160MiB` with two concurrent derivations; measure these resource limits on the selected host rather than weakening password handling to fit an undersized VM.

Admin MFA is new work in AUTH-005, with vetted TOTP implementation, encrypted secret, hashed single-use recovery and backend enforcement. Provider ingress and scheduler credentials are scoped machine access, never staff cookies. Operator recovery is explicit and auditable.

Reject forged actors and unsupported writable fields. Safe errors distinguish400 malformed request,401 invalid session,403 denied action,404 unavailable authorized resource,409 conflict,413 size limit,429 throttle with retry guidance and503 required persistence unavailable. Use bounded bodies/queries, safe error codes and request IDs; never log tokens, transcripts or patient payload.

### Call and dispatch state

| Current | Allowed different next states |
|---|---|
| queued | starting, canceled, failed |
| starting | in_progress, failed, canceled |
| in_progress | finalizing, failed, canceled |
| finalizing | completed, failed |
| completed / failed / canceled | None |

Exact replay is a no-op. Terminal detail enrichment uses the detail path. State and mandatory audit share one transaction; row locks/unique constraints enforce concurrent transitions and attempt-number allocation. Equivalent creation idempotency returns the same record; conflicting input returns409.

Use unique schedule/due occurrence identity, bounded claim batches and PostgreSQL leases. Proposed starting settings are batch50, lease60seconds and heartbeat20seconds; validate under load. Enforce fencing tokens and an aggregate20-conversation reservation limit. Expired leases after a provider send require reconciliation before retry, because a timeout does not prove the call was never placed. Do not hold database locks over network requests.

Outbound attempts retain required patient/schedule relationships. Inbound attempts use an explicit direction/purpose schema with conditional relationships and verified later association. Never insert fake patient/schedule records to satisfy current non-null constraints.

### Follow-up, intake and exports

Work transitions are `open → acknowledged → in_progress → resolved/canceled`, with explicitly authorized shortcuts or reopen behavior specified by the work contract. Assignment is independent. Delivery does not acknowledge work. Compute deadlines in clinic working time with timezone/calendar version and backup-owner policy.

Intake writes require current draft revision; stale writes return409. Submission snapshot creation and lifecycle update are atomic and idempotent. Submitted snapshots never mutate; corrections create an amendment. Browser and telephone share schema/validators and preserve confirmed partial answers across disconnect. Patient/guardian confirmation controls submission, not model confidence.

Reports derive from canonical persisted queries with stated denominators and clinic timezone. Exports inherit authorization, audit safe metadata and neutralize spreadsheet formulas. Keep fixed demo reports visibly synthetic until replacement.

### Deployment and recovery boundary

Use one clinic VM deployment initially with controlled frontend/backend/worker processes, private PostgreSQL access, TLS ingress, pinned artifacts and least privilege. A single VM has a single failure domain. Do not call it highly available. Use off-host encrypted backups with continuous WAL archiving and isolated restore drills. Provisional recovery targets are RPO15minutes and RTO4hours; clinic approval and measured proof are required before promising them.

No microservices, distributed queue infrastructure, shared tenancy, Kubernetes or AI orchestration framework is required by this plan. Introduce infrastructure only after a measured constraint demonstrates its necessity and the architecture decision is reviewed.

## Step-by-step execution guide

### How to execute one ticket

1. Choose a ticket whose dependencies have accepted completion evidence. Read its complete packet and shared contracts.
2. Reconcile branch/main drift and applicable repository instructions. Use graph tools for code discovery; if unavailable, record the limitation and inspect source directly.
3. Record exact files, callers, database constraints, baseline checks and current failures. Do not trust proposed paths as implemented files.
4. Resolve required clinical/operator decisions before coding dependent behavior. Estimate that ticket after reconnaissance; ticket count is not effort percentage.
5. Implement the smallest logical change. Make reviewable micro-commits for meaningful changes, not arbitrary2% increments or one commit per trivial line.
6. Follow ACTION / WHY / VERIFY steps and stop at a failed checkpoint. Test concrete outcomes and failure behavior, not a mirror of implementation details.
7. Run relevant ordinary, PostgreSQL, browser, fixture, lint/typecheck/build checks. Keep all destructive database tests isolated.
8. Review the complete ticket group and publish a bounded PR by theme. Record exact commands, commit and observed results; never convert an unrun check to a pass.
9. Rehearse rollback/recovery where required. Obtain named clinic/operator acceptance for decision and operational tasks.
10. Fill completion record, move the ticket to Completed only after its full definition of done, update incoming links and the master inventory, then unblock dependents.

### Practical phase sequence

| Phase | Work | Exit proof |
|---|---|---|
| A | Reconcile foundation; dependency/TLS/proxy/request/intake integrity repair; MFA | Security and regression checks pass against the current branch |
| B | Buyer, geography/language, guardian, clinical follow-up and vendor decisions | Dated approved decision records; no invented buyer approval |
| C | Patient/guardian/import, consent/suppression, occurrence scheduling and leases | Durable valid identities, opt-out race and scheduling concurrency tests |
| D | Real-provider contract, inbound/dispatch schema, verified ingress, reconciliation, media/conversation/answers | Controlled-call readiness; no real call before policy/staging gates |
| E | Durable staff work, overdue handling, canonical UI/reports/audit/admin | Staff can acknowledge and resolve actual persisted work |
| F | VM packaging, recovery, monitoring, synthetic staging, controlled call and load | Complete Release1 acceptance and scoped buyer approval |
| G | Both intake channels, access/resume/conflicts/review/amendments/PDF | Complete Release2 acceptance and Release1 regressions |
| H | Independent callback capture through all three channels and reporting | Complete Release3 acceptance and combined regressions |
| I | Governance, clinic handover and evidence matrix | Runs alongside dependencies; not postponed until the end |

Group order is an explanation, not permission to ignore dependencies. For example, controlled-call QA depends on staging and staff follow-up; governance enables recovery. The following generated readiness waves contain no dependency cycles. A wave is not a schedule estimate and does not require parallel agents.

1. **Readiness wave 1:** [DOC-001](tickets/Pending/DOC-001-reconcile-current-status-and-foundation-evidence.md).
2. **Readiness wave 2:** [SEC-001](tickets/Pending/SEC-001-resolve-dependency-vulnerabilities-with-regression-proof.md), [DEC-001](tickets/Pending/DEC-001-agree-a-clinic-buyer-scope-and-acceptance-contract.md), [QA-004](tickets/Pending/QA-004-maintain-requirement-to-evidence-acceptance-matrix.md).
3. **Readiness wave 3:** [SEC-002](tickets/Pending/SEC-002-verify-database-transport-and-bound-connection-failures.md), [DEC-002](tickets/Pending/DEC-002-approve-launch-country-languages-and-data-boundaries.md).
4. **Readiness wave 4:** [SEC-003](tickets/Pending/SEC-003-verify-proxy-trust-login-limits-and-hash-capacity.md), [DEC-003](tickets/Pending/DEC-003-approve-adult-minor-and-guardian-authority-rules.md).
5. **Readiness wave 5:** [AUTH-005](tickets/Pending/AUTH-005-add-administrator-mfa-and-audited-recovery.md), [SEC-004](tickets/Pending/SEC-004-bound-requests-and-normalize-safe-errors-and-logs.md), [DEC-004](tickets/Pending/DEC-004-approve-clinic-hours-follow-up-and-safety-responsibilities.md), [PAT-001](tickets/Pending/PAT-001-build-canonical-staff-patient-management.md), [GOV-001](tickets/Pending/GOV-001-define-and-implement-retention-access-and-deletion-policy.md).
6. **Readiness wave 6:** [SEC-005](tickets/Pending/SEC-005-secure-public-intake-capabilities-and-trusted-provenance.md), [DEC-005](tickets/Pending/DEC-005-select-vendors-hosting-and-a-bounded-spending-model.md), [PAT-002](tickets/Pending/PAT-002-persist-guardian-relationships-and-enforce-authority.md), [ADM-001](tickets/Pending/ADM-001-complete-staff-administration-and-clinic-settings.md).
7. **Readiness wave 7:** [SEC-006](tickets/Pending/SEC-006-make-intake-drafts-submissions-and-review-atomic.md), [PAT-003](tickets/Pending/PAT-003-add-previewed-idempotent-patient-csv-import.md), [CNS-001](tickets/Pending/CNS-001-persist-consent-and-communication-preference-history.md), [WRK-001](tickets/Pending/WRK-001-persist-one-shared-follow-up-work-item-lifecycle.md), [OPS-001](tickets/Pending/OPS-001-package-one-clinic-on-a-low-fixed-cost-vm.md).
8. **Readiness wave 8:** [CNS-002](tickets/Pending/CNS-002-enforce-opt-out-immediately-before-every-dispatch.md), [SCH-001](tickets/Pending/SCH-001-model-post-visit-occurrences-and-immutable-script-versions.md), [WRK-002](tickets/Pending/WRK-002-build-staff-queue-assignment-acknowledgment-and-resolution.md), [OPS-002](tickets/Pending/OPS-002-prove-encrypted-backup-and-point-in-time-recovery.md).
9. **Readiness wave 9:** [SCH-002](tickets/Pending/SCH-002-implement-scheduling-windows-recurrence-and-bounded-retries.md), [WRK-003](tickets/Pending/WRK-003-route-overdue-work-using-clinic-hours-policy.md).
10. **Readiness wave 10:** [SCH-003](tickets/Pending/SCH-003-claim-due-work-fairly-with-leases-and-concurrency-limits.md).
11. **Readiness wave 11:** [TEL-001](tickets/Pending/TEL-001-define-provider-adapters-and-canonical-event-semantics.md).
12. **Readiness wave 12:** [DATA-003](tickets/Pending/DATA-003-add-explicit-inbound-and-dispatch-identity-relationships.md).
13. **Readiness wave 13:** [TEL-002](tickets/Pending/TEL-002-verify-and-durably-receive-provider-events.md).
14. **Readiness wave 14:** [TEL-003](tickets/Pending/TEL-003-dispatch-cancel-and-reconcile-uncertain-provider-outcomes.md).
15. **Readiness wave 15:** [VOI-001](tickets/Pending/VOI-001-build-authenticated-bounded-telephone-audio-transport.md), [OPS-003](tickets/Pending/OPS-003-add-actionable-monitoring-and-usage-cost-controls.md).
16. **Readiness wave 16:** [VOI-002](tickets/Pending/VOI-002-implement-approved-fixed-script-conversation-behavior.md), [OPS-004](tickets/Pending/OPS-004-establish-an-isolated-synthetic-staging-environment.md).
17. **Readiness wave 17:** [VOI-003](tickets/Pending/VOI-003-persist-confirmed-answers-and-late-transcript-enrichment.md), [GOV-002](tickets/Pending/GOV-002-prepare-clinic-onboarding-support-and-offboarding.md).
18. **Readiness wave 18:** [QA-002](tickets/Pending/QA-002-prove-one-complete-controlled-real-call-workflow.md), [UI-001](tickets/Pending/UI-001-replace-synthetic-operational-dashboards-with-persisted-views.md).
19. **Readiness wave 19:** [UI-002](tickets/Pending/UI-002-complete-patient-and-call-review-screens.md), [RPT-001](tickets/Pending/RPT-001-replace-fixed-reports-and-make-exports-safe.md), [QA-003](tickets/Pending/QA-003-measure-load-and-failure-recovery-at-the-planning-scale.md).
20. **Readiness wave 20:** [AUD-001](tickets/Pending/AUD-001-implement-authoritative-audit-review-and-coverage.md).
21. **Readiness wave 21:** [REL-001](tickets/Pending/REL-001-accept-the-complete-post-visit-check-in-release.md).
22. **Readiness wave 22:** [INT-001](tickets/Pending/INT-001-define-one-versioned-intake-contract-for-both-voice-channels.md).
23. **Readiness wave 23:** [INT-002](tickets/Pending/INT-002-complete-patient-and-guardian-access-expiry-and-resume.md).
24. **Readiness wave 24:** [INT-003](tickets/Pending/INT-003-deliver-browser-microphone-intake-with-review.md), [INT-004](tickets/Pending/INT-004-deliver-verified-telephone-intake.md).
25. **Readiness wave 25:** [INT-005](tickets/Pending/INT-005-resolve-cross-channel-intake-conflicts-and-recovery.md).
26. **Readiness wave 26:** [INT-006](tickets/Pending/INT-006-complete-review-amendments-and-reproducible-pdfs.md).
27. **Readiness wave 27:** [REL-002](tickets/Pending/REL-002-accept-complete-browser-and-telephone-intake-release.md).
28. **Readiness wave 28:** [CBK-001](tickets/Pending/CBK-001-model-standalone-callback-requests-independently.md).
29. **Readiness wave 29:** [CBK-002](tickets/Pending/CBK-002-deliver-abuse-resistant-public-web-callback-requests.md), [CBK-003](tickets/Pending/CBK-003-deliver-telephone-callback-request-capture.md), [CBK-004](tickets/Pending/CBK-004-complete-staff-entered-callback-handling.md).
30. **Readiness wave 30:** [CBK-005](tickets/Pending/CBK-005-add-callback-reporting-and-recovery-evidence.md).
31. **Readiness wave 31:** [REL-003](tickets/Pending/REL-003-accept-the-complete-standalone-callback-release.md).

## Complete ticket inventory

**59 new tickets:0 Completed,59 Not completed.** Ten existing foundation packets are preserved separately above. The new count measures documents, not effort or product completion. All new files remain under Pending until execution and acceptance; this publication creates no new implementation evidence.

Each linked ticket is the authoritative execution manual: current/target behavior, source entry points, contracts, dependencies, ordered steps, verification checkpoints, test assertions, failure diagnosis, rollback and completion record. Do not maintain a second divergent copy of the full ticket in this master.

### A — Truth and security

| Ticket | Status | Prerequisites |
|---|---|---|
| [DOC-001 — Reconcile current status and foundation evidence](tickets/Pending/DOC-001-reconcile-current-status-and-foundation-evidence.md) | Not completed | Merged foundation baseline |
| [SEC-001 — Resolve dependency vulnerabilities with regression proof](tickets/Pending/SEC-001-resolve-dependency-vulnerabilities-with-regression-proof.md) | Not completed | DOC-001 |
| [SEC-002 — Verify database transport and bound connection failures](tickets/Pending/SEC-002-verify-database-transport-and-bound-connection-failures.md) | Not completed | SEC-001 |
| [SEC-003 — Verify proxy trust login limits and hash capacity](tickets/Pending/SEC-003-verify-proxy-trust-login-limits-and-hash-capacity.md) | Not completed | SEC-002 |
| [AUTH-005 — Add administrator MFA and audited recovery](tickets/Pending/AUTH-005-add-administrator-mfa-and-audited-recovery.md) | Not completed | SEC-003 |
| [SEC-004 — Bound requests and normalize safe errors and logs](tickets/Pending/SEC-004-bound-requests-and-normalize-safe-errors-and-logs.md) | Not completed | SEC-003 |
| [SEC-005 — Secure public intake capabilities and trusted provenance](tickets/Pending/SEC-005-secure-public-intake-capabilities-and-trusted-provenance.md) | Not completed | SEC-004 |
| [SEC-006 — Make intake drafts submissions and review atomic](tickets/Pending/SEC-006-make-intake-drafts-submissions-and-review-atomic.md) | Not completed | SEC-005 |

### B — Owner decisions

| Ticket | Status | Prerequisites |
|---|---|---|
| [DEC-001 — Agree a clinic buyer scope and acceptance contract](tickets/Pending/DEC-001-agree-a-clinic-buyer-scope-and-acceptance-contract.md) | Not completed | DOC-001 |
| [DEC-002 — Approve launch country languages and data boundaries](tickets/Pending/DEC-002-approve-launch-country-languages-and-data-boundaries.md) | Not completed | DEC-001 |
| [DEC-003 — Approve adult minor and guardian authority rules](tickets/Pending/DEC-003-approve-adult-minor-and-guardian-authority-rules.md) | Not completed | DEC-002 |
| [DEC-004 — Approve clinic-hours follow-up and safety responsibilities](tickets/Pending/DEC-004-approve-clinic-hours-follow-up-and-safety-responsibilities.md) | Not completed | DEC-001, DEC-003 |
| [DEC-005 — Select vendors hosting and a bounded spending model](tickets/Pending/DEC-005-select-vendors-hosting-and-a-bounded-spending-model.md) | Not completed | DEC-002, DEC-004 |

### C — Patient and scheduling data

| Ticket | Status | Prerequisites |
|---|---|---|
| [PAT-001 — Build canonical staff patient management](tickets/Pending/PAT-001-build-canonical-staff-patient-management.md) | Not completed | SEC-003, DEC-003 |
| [PAT-002 — Persist guardian relationships and enforce authority](tickets/Pending/PAT-002-persist-guardian-relationships-and-enforce-authority.md) | Not completed | PAT-001, DEC-003 |
| [PAT-003 — Add previewed idempotent patient CSV import](tickets/Pending/PAT-003-add-previewed-idempotent-patient-csv-import.md) | Not completed | PAT-001, PAT-002 |
| [CNS-001 — Persist consent and communication preference history](tickets/Pending/CNS-001-persist-consent-and-communication-preference-history.md) | Not completed | PAT-002, DEC-002 |
| [CNS-002 — Enforce opt-out immediately before every dispatch](tickets/Pending/CNS-002-enforce-opt-out-immediately-before-every-dispatch.md) | Not completed | CNS-001 |
| [SCH-001 — Model post-visit occurrences and immutable script versions](tickets/Pending/SCH-001-model-post-visit-occurrences-and-immutable-script-versions.md) | Not completed | PAT-001, CNS-001, DEC-004 |
| [SCH-002 — Implement scheduling windows recurrence and bounded retries](tickets/Pending/SCH-002-implement-scheduling-windows-recurrence-and-bounded-retries.md) | Not completed | SCH-001, DEC-004 |
| [SCH-003 — Claim due work fairly with leases and concurrency limits](tickets/Pending/SCH-003-claim-due-work-fairly-with-leases-and-concurrency-limits.md) | Not completed | SCH-002, CNS-002 |

### D — Telephony and controlled call

| Ticket | Status | Prerequisites |
|---|---|---|
| [TEL-001 — Define provider adapters and canonical event semantics](tickets/Pending/TEL-001-define-provider-adapters-and-canonical-event-semantics.md) | Not completed | DEC-005, SCH-003 |
| [DATA-003 — Add explicit inbound and dispatch identity relationships](tickets/Pending/DATA-003-add-explicit-inbound-and-dispatch-identity-relationships.md) | Not completed | TEL-001 |
| [TEL-002 — Verify and durably receive provider events](tickets/Pending/TEL-002-verify-and-durably-receive-provider-events.md) | Not completed | DATA-003 |
| [TEL-003 — Dispatch cancel and reconcile uncertain provider outcomes](tickets/Pending/TEL-003-dispatch-cancel-and-reconcile-uncertain-provider-outcomes.md) | Not completed | TEL-002, CNS-002 |
| [VOI-001 — Build authenticated bounded telephone audio transport](tickets/Pending/VOI-001-build-authenticated-bounded-telephone-audio-transport.md) | Not completed | TEL-003 |
| [VOI-002 — Implement approved fixed-script conversation behavior](tickets/Pending/VOI-002-implement-approved-fixed-script-conversation-behavior.md) | Not completed | VOI-001, DEC-004, PAT-002 |
| [VOI-003 — Persist confirmed answers and late transcript enrichment](tickets/Pending/VOI-003-persist-confirmed-answers-and-late-transcript-enrichment.md) | Not completed | VOI-002 |
| [QA-002 — Prove one complete controlled real-call workflow](tickets/Pending/QA-002-prove-one-complete-controlled-real-call-workflow.md) | Not completed | VOI-003, WRK-003, OPS-004, GOV-001 |

### E — Staff operations

| Ticket | Status | Prerequisites |
|---|---|---|
| [WRK-001 — Persist one shared follow-up work-item lifecycle](tickets/Pending/WRK-001-persist-one-shared-follow-up-work-item-lifecycle.md) | Not completed | PAT-002, DEC-004 |
| [WRK-002 — Build staff queue assignment acknowledgment and resolution](tickets/Pending/WRK-002-build-staff-queue-assignment-acknowledgment-and-resolution.md) | Not completed | WRK-001 |
| [WRK-003 — Route overdue work using clinic-hours policy](tickets/Pending/WRK-003-route-overdue-work-using-clinic-hours-policy.md) | Not completed | WRK-002, DEC-004 |
| [UI-001 — Replace synthetic operational dashboards with persisted views](tickets/Pending/UI-001-replace-synthetic-operational-dashboards-with-persisted-views.md) | Not completed | SCH-003, WRK-002, VOI-003 |
| [UI-002 — Complete patient and call review screens](tickets/Pending/UI-002-complete-patient-and-call-review-screens.md) | Not completed | UI-001 |
| [RPT-001 — Replace fixed reports and make exports safe](tickets/Pending/RPT-001-replace-fixed-reports-and-make-exports-safe.md) | Not completed | UI-001 |
| [AUD-001 — Implement authoritative audit review and coverage](tickets/Pending/AUD-001-implement-authoritative-audit-review-and-coverage.md) | Not completed | SEC-006, WRK-002, RPT-001 |
| [ADM-001 — Complete staff administration and clinic settings](tickets/Pending/ADM-001-complete-staff-administration-and-clinic-settings.md) | Not completed | AUTH-005, DEC-004 |

### F — Operations and Release 1

| Ticket | Status | Prerequisites |
|---|---|---|
| [OPS-001 — Package one clinic on a low-fixed-cost VM](tickets/Pending/OPS-001-package-one-clinic-on-a-low-fixed-cost-vm.md) | Not completed | SEC-001, SEC-002, SEC-004, DEC-005, AUTH-005 |
| [OPS-002 — Prove encrypted backup and point-in-time recovery](tickets/Pending/OPS-002-prove-encrypted-backup-and-point-in-time-recovery.md) | Not completed | OPS-001, GOV-001 |
| [OPS-003 — Add actionable monitoring and usage-cost controls](tickets/Pending/OPS-003-add-actionable-monitoring-and-usage-cost-controls.md) | Not completed | OPS-001, TEL-003 |
| [OPS-004 — Establish an isolated synthetic staging environment](tickets/Pending/OPS-004-establish-an-isolated-synthetic-staging-environment.md) | Not completed | OPS-001, OPS-002, OPS-003 |
| [QA-003 — Measure load and failure recovery at the planning scale](tickets/Pending/QA-003-measure-load-and-failure-recovery-at-the-planning-scale.md) | Not completed | OPS-004, QA-002 |
| [REL-001 — Accept the complete post-visit check-in release](tickets/Pending/REL-001-accept-the-complete-post-visit-check-in-release.md) | Not completed | SEC-006, PAT-003, CNS-002, SCH-003, QA-003, UI-002, RPT-001, AUD-001, ADM-001, GOV-001, GOV-002, QA-004 |

### G — Release 2 intake

| Ticket | Status | Prerequisites |
|---|---|---|
| [INT-001 — Define one versioned intake contract for both voice channels](tickets/Pending/INT-001-define-one-versioned-intake-contract-for-both-voice-channels.md) | Not completed | SEC-006, PAT-002, REL-001 |
| [INT-002 — Complete patient and guardian access, expiry and resume](tickets/Pending/INT-002-complete-patient-and-guardian-access-expiry-and-resume.md) | Not completed | INT-001, DEC-003 |
| [INT-003 — Deliver browser microphone intake with review](tickets/Pending/INT-003-deliver-browser-microphone-intake-with-review.md) | Not completed | INT-002 |
| [INT-004 — Deliver verified telephone intake](tickets/Pending/INT-004-deliver-verified-telephone-intake.md) | Not completed | INT-002, VOI-003 |
| [INT-005 — Resolve cross-channel intake conflicts and recovery](tickets/Pending/INT-005-resolve-cross-channel-intake-conflicts-and-recovery.md) | Not completed | INT-003, INT-004 |
| [INT-006 — Complete review, amendments and reproducible PDFs](tickets/Pending/INT-006-complete-review-amendments-and-reproducible-pdfs.md) | Not completed | INT-005 |
| [REL-002 — Accept complete browser and telephone intake release](tickets/Pending/REL-002-accept-complete-browser-and-telephone-intake-release.md) | Not completed | INT-006, QA-004, GOV-001, GOV-002 |

### H — Release 3 callbacks

| Ticket | Status | Prerequisites |
|---|---|---|
| [CBK-001 — Model standalone callback requests independently](tickets/Pending/CBK-001-model-standalone-callback-requests-independently.md) | Not completed | WRK-001, REL-002 |
| [CBK-002 — Deliver abuse-resistant public web callback requests](tickets/Pending/CBK-002-deliver-abuse-resistant-public-web-callback-requests.md) | Not completed | CBK-001 |
| [CBK-003 — Deliver telephone callback request capture](tickets/Pending/CBK-003-deliver-telephone-callback-request-capture.md) | Not completed | CBK-001, TEL-002, VOI-002 |
| [CBK-004 — Complete staff-entered callback handling](tickets/Pending/CBK-004-complete-staff-entered-callback-handling.md) | Not completed | CBK-001 |
| [CBK-005 — Add callback reporting and recovery evidence](tickets/Pending/CBK-005-add-callback-reporting-and-recovery-evidence.md) | Not completed | CBK-002, CBK-003, CBK-004, RPT-001 |
| [REL-003 — Accept the complete standalone callback release](tickets/Pending/REL-003-accept-the-complete-standalone-callback-release.md) | Not completed | CBK-005, QA-004, GOV-001, GOV-002 |

### I — Governance and evidence

| Ticket | Status | Prerequisites |
|---|---|---|
| [GOV-001 — Define and implement retention, access and deletion policy](tickets/Pending/GOV-001-define-and-implement-retention-access-and-deletion-policy.md) | Not completed | DEC-002, DEC-003 |
| [GOV-002 — Prepare clinic onboarding, support and offboarding](tickets/Pending/GOV-002-prepare-clinic-onboarding-support-and-offboarding.md) | Not completed | OPS-004, GOV-001 |
| [QA-004 — Maintain requirement-to-evidence acceptance matrix](tickets/Pending/QA-004-maintain-requirement-to-evidence-acceptance-matrix.md) | Not completed | DOC-001 |

## Provider and cost decision

These are research inputs dated2026-09-19, not a selected clinical deployment, vendor contract or approved budget. Reconfirm current prices, regional availability, data-processing terms and service eligibility in DEC-005 before purchase or provider implementation. A low sticker price cannot establish suitability for a specific geography or patient-data obligation.

**Recommended evaluation order:** compare Twilio and Telnyx for the selected country/language and data requirements; use a small controlled benchmark before selecting. Twilio is a practical first integration candidate because documented bidirectional media and regional options match the proposed bridge, but selection remains conditional. Twilio documents US1 as default and IE1/AU1 support for Media Streams; implement actual vendor request verification and respect stream constraints. [Twilio Media Streams documentation](https://www.twilio.com/docs/voice/media-streams).

Telnyx is a cost comparator: its published Voice API pricing lists media streaming at$0.0035/minute, which is **not** the complete call price. Compare destination termination, numbers, minimums, recording-disabled operation, support and data region as a complete package. [Telnyx Voice API pricing](https://telnyx.com/pricing/voice-api).

Use a selected real-time model or bounded STT/model/TTS pipeline only after testing latency, barge-in, language accuracy, reliability and data terms. OpenAI real-time pricing is token-based; do not convert it into a guaranteed per-minute price without measured audio/text token usage and silence handling. [OpenAI realtime model documentation](https://developers.openai.com/api/docs/models/gpt-realtime).

### Worked telephony illustration, not a budget

Assume22 operating days,1000 total attempts/day including retries, all connected, and average connected duration3,5 or8minutes. Real models must include connection fraction, failed-call billing, rounding and retry mix. US Twilio local outbound$0.014/minute plus Media Streams$0.0044/minute gives an illustrative$0.0184/minute. The geography has **not** been chosen; these US numbers are not a quote for another market. [Twilio US voice pricing](https://www.twilio.com/en-us/voice/pricing/us?product=crm).

| Average connected minutes | Monthly connected minutes at100% connection | Illustrative telephony + streaming only |
|---|---|---|
| 3 | 66,000 | $1,214.40 |
| 5 | 110,000 | $2,024.00 |
| 8 | 176,000 | $3,238.40 |

At connection fraction `f`, this simplified connected-minute component scales by `f`; other charges may not. Add AI/STT/TTS usage, phone numbers, verification, notifications, VM, backups, storage, egress, monitoring, taxes and support. Measure token costs and provider bills during controlled testing. Establish a clinic-approved daily cap, concurrent reservation limit, alert threshold and hard-stop procedure before live outreach. Total service cost can be dominated by usage even on a cheap VM.

For a fixed-host benchmark, AWS Lightsail lists Linux8GB/2vCPU at$44/month and16GB/4vCPU at$84/month. These figures do not prove either size supports20 conversations plus staff/password hashing/database load, or that the service/region is eligible for the intended clinical obligations. Benchmark and verify eligibility before selection. [Lightsail pricing](https://aws.amazon.com/lightsail/pricing/).

For PostgreSQL recovery, evaluate pgBackRest base backups/WAL archiving and isolated point-in-time restore. A backup completion message is not restore proof. [pgBackRest user guide](https://pgbackrest.org/user-guide.html).

## Release acceptance and rollback

### Foundation security gate

- Direct unauthorized backend access fails before protected data read/mutation.
- Disabled users, revoked sessions and forced-password-change accounts cannot retain ordinary access.
- Dependency vulnerabilities have an explicit reviewed disposition; known critical/high runtime exposure is not hidden by passing tests.
- Database TLS verifies identity; connection/query and request/hash resource use are bounded.
- Intake capabilities expire/revoke, provenance cannot be forged, drafts use revisions and immutable submissions commit atomically.
- Existing login/intake/staff review/PDF behavior passes regression checks after repairs.
- Fresh and additive upgrade migrations succeed on isolated databases, with diagnostics for invalid old relationships.

### Controlled-call gate

Prerequisites: approved market/language/provider/policy, isolated synthetic staging, allowlisted consenting testers, recordings disabled, durable staff queue, opt-out suppression and a named operator. Use synthetic patient facts; adult testers may roleplay guardian/minor scenarios without involving real child data. Start with one concurrent call and a small approved attempt/spend cap.

Proof: call connects, correct fixed script/version runs, identity/disclosure rules hold, answers persist, opt-out suppresses future dispatch, callback request reaches durable work, staff can acknowledge/resolve, duplicate events/retries are safe and failure/late transcript recovery works. A successful call is an engineering milestone, not commercial completion.

### Release1: complete post-visit check-ins

Patient setup/import, guardian/consent, scheduling, real voice, confirmed answers, opt-out, staff callback work, operational screens, reporting, audit, administrator management, monitoring, backup/restore, training/support and buyer-agreed acceptance must all pass. Rehearse provider/database/worker failures and aggregate planning load. No missing in-scope feature is shifted to a future release merely to label this complete.

### Release2: complete voice-assisted intake

Both browser microphone and telephone intake must work through verified access, guardian policy, draft/resume, answer confirmation, cross-channel conflicts, submission, staff review, amendment and PDF. Recheck Release1 and new data/retention/cost/capacity controls. A voice capture demo without review/resume/recovery is not acceptance.

### Release3: complete standalone callback product

Web, telephone and staff entry must operate without a check-in attempt, through safe identity association, assignment, acknowledgment, contact attempts, resolution, reporting, audit and recovery. Service expectations match actual clinic coverage. Test all products together against approved aggregate limits.

### Rollback and incident rules

Deploy only approved changes to synthetic staging first. Retain additive schema and use a previous secure compatible artifact. If no secure compatible rollback exists, disable affected entrypoints/outreach and fix forward. Never restore unauthenticated APIs, shared staff tokens, unverifiable database TLS or cached durable success. Preserve staff work, suppression and audit records. Restored backups start with dispatch disabled until provider operations, consent/deletion ledgers and work are reconciled.

## Evidence and maintenance

### Commands available in the audited repository

The following are existing scripts, not evidence they were rerun for this documentation publication:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run check:voice-agent
npm run test:integration
npm run build
npm run test:browser
```

Use `TEST_DATABASE_URL` pointed only at an explicitly isolated disposable test database for PostgreSQL/browser suites as required by their configuration. Inspect the runner before executing migrations/reset. Do not run `db:rollback:all` against a clinic database. Capture Node/npm/PostgreSQL versions and commit for each run. No provider or application deployment command is implied by this list.

### Required evidence levels

| Level | What it proves | What it cannot prove alone |
|---|---|---|
| Static source review | Implemented control/contract exists at a commit | Runtime success or human acceptance |
| Unit/fixture tests | Selected deterministic behavior | Database transactions, browser or deployment |
| PostgreSQL integration | Constraints, concurrency and rollback in a real test database | Public proxy or provider behavior |
| Browser regression | Rendered workflow through tested configuration | Clinical appropriateness or all deployed infrastructure |
| Hosted CI | Reproducible automated checks on a recorded commit | Staging readiness or buyer sign-off |
| Synthetic staging | Actual TLS/proxy/process/deployment behavior | Real-data policy approval |
| Controlled call | Capped provider/media/workflow evidence | Entire commercial scope |
| Clinic/operator acceptance | Approved scoped usability and operational responsibility | Features outside agreed scope |

QA-004 owns the traceable requirement matrix. Release tickets refresh affected rows using current commit/environment. Preserve failed evidence and changed-contract invalidation. Keep unresolved approval fields unresolved.

### Documentation publication record

This change saves this master and59 detailed Pending ticket files. Validation checks count/unique IDs, dependency closure and absence of cycles, existing source paths, local links, required ticket structure, Markdown fences and whitespace. Documentation validation is not application acceptance. GitHub PR/CI status is reported separately when published; no application deployment is performed by this documentation change.

### Immediate next move

Review the saved scope and begin **DOC-001**, reconciling the merged foundation and historical acceptance records. Then execute ready security tickets and obtain the clinic decision records. Implement real provider behavior only after its explicit policy, data and staging prerequisites. Do not reopen the already implemented foundation as if no code existed, and do not claim the three commercial releases are complete.
