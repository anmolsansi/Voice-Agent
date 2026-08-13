# Client Readiness Checklist

## Purpose

This checklist answers one question:

> Is CheckIn Care ready for a real client to depend on?

A feature can be impressive in a demo and still fail this checklist.

The checklist is intentionally strict because CheckIn Care is intended to support patient outreach and human follow-up workflows. The product should not call itself production-ready merely because the main screen loads or a single test call succeeds.

Use this document as a release gate.

Every unchecked item should have one of these labels:

- **Blocker**: client launch must not proceed.
- **Accepted pilot limitation**: the limitation is understood, documented, approved by the responsible stakeholders, and does not violate the defined pilot safety/security boundary.
- **Not applicable**: the feature is genuinely outside the approved use case.

Do not use `Not applicable` to hide unfinished work that the use case actually requires.

---

# 1. Product scope

- [ ] The first production use case is written in one paragraph.
- [ ] The target client type is defined.
- [ ] The target users are defined.
- [ ] The product clearly states what the automated system can do.
- [ ] The product clearly states what the automated system cannot do.
- [ ] Emergency dispatch is explicitly in or out of scope.
- [ ] Diagnosis is explicitly in or out of scope.
- [ ] Medication changes are explicitly in or out of scope.
- [ ] Human follow-up responsibility is documented.
- [ ] The team agrees what "completed check-in" means.
- [ ] The team agrees what "escalation" means.
- [ ] The team agrees what "client-ready" means.

## Launch blocker examples

- The engineering team thinks the product is a demo while the client thinks it is a clinical monitoring system.
- The product promises a human callback but no one owns the callback workflow.

---

# 2. Organization isolation

- [ ] Every client has an organization record.
- [ ] Every staff user belongs to the correct organization or approved platform role.
- [ ] Every patient belongs to an organization.
- [ ] Every schedule is organization-scoped.
- [ ] Every call session is organization-scoped.
- [ ] Every call attempt is organization-scoped directly or through a safe parent relationship.
- [ ] Every transcript is organization-scoped.
- [ ] Every escalation is organization-scoped.
- [ ] Every report query is organization-scoped.
- [ ] Every audit query is organization-scoped.
- [ ] Every export is organization-scoped.
- [ ] Cross-organization API tests pass.
- [ ] Cross-organization export tests pass.

## Launch blocker

Any known path where Clinic A can read or change Clinic B data.

---

# 3. Authentication

- [ ] Production does not depend on one shared staff token for all users.
- [ ] Each staff user has an individual identity.
- [ ] Login/session behavior is secure.
- [ ] Sessions expire according to policy.
- [ ] Logout invalidates or safely ends the session.
- [ ] Disabled users cannot continue using old sessions indefinitely.
- [ ] Account recovery/reset flow is secure.
- [ ] Login attempts are protected against obvious abuse.
- [ ] Privileged users have the required stronger authentication controls.
- [ ] Authentication errors do not leak sensitive system details.

---

# 4. Authorization and roles

- [ ] Staff roles are documented.
- [ ] Permission matrix is documented.
- [ ] Backend checks permissions, not only frontend buttons.
- [ ] Care coordinators cannot perform admin-only actions.
- [ ] Read-only users cannot modify records.
- [ ] Transcript access follows role policy.
- [ ] Recording access follows role policy.
- [ ] Export access follows role policy.
- [ ] Safety-setting changes require the correct privileged role.
- [ ] User-management actions require the correct privileged role.
- [ ] Permission tests run automatically.

---

# 5. Patient model

- [ ] There is one canonical patient source of truth.
- [ ] The voice product does not use an independent in-memory patient store in production.
- [ ] Patient has organization ownership.
- [ ] Phone number is validated.
- [ ] Timezone is stored or safely derived according to approved rules.
- [ ] Active/inactive state is defined.
- [ ] External client identifier rules are defined.
- [ ] Duplicate-patient behavior is documented.
- [ ] Patient updates are audited where required.

---

# 6. Consent and communication state

- [ ] The client has approved the communication-consent model for the intended use.
- [ ] Consent/permission source is recorded where required.
- [ ] Consent/permission timestamp is recorded where required.
- [ ] Opt-out is a durable state.
- [ ] Wrong-number state is durable.
- [ ] Temporary pause behavior is defined if supported.
- [ ] Future automated calls check communication state before dialing.
- [ ] Patient opt-out during a call stops future automation.
- [ ] Staff can see why a patient is not callable.
- [ ] Consent/recording wording has received required external review.

---

# 7. Care program

- [ ] At least one production care program is defined.
- [ ] Program purpose is documented.
- [ ] Questions are approved by the client.
- [ ] Program versioning exists.
- [ ] Published versions cannot silently change historical behavior.
- [ ] Retry policy is defined.
- [ ] Call windows are defined.
- [ ] Completion criteria are defined.
- [ ] Escalation rules are defined.
- [ ] Unsupported patient questions have an approved handling path.
- [ ] Program can be tested without calling live patients.
- [ ] Program has passed client acceptance tests.

---

# 8. Scheduling

- [ ] Schedules use the canonical patient model.
- [ ] Schedules use the correct care-program version.
- [ ] Timezone behavior is tested.
- [ ] Allowed call windows are tested.
- [ ] Retry timing is tested.
- [ ] Maximum attempts are enforced.
- [ ] Opted-out patients are skipped.
- [ ] Inactive patients are skipped.
- [ ] Invalid phone numbers are skipped and surfaced.
- [ ] Duplicate scheduler execution does not duplicate intended patient calls.
- [ ] Worker crash/restart behavior is understood.
- [ ] Failed scheduled work is visible to operations.

---

# 9. Call domain

- [ ] Difference between call session and call attempt is documented.
- [ ] Canonical tables are selected.
- [ ] Duplicate/legacy models have a migration plan.
- [ ] Allowed call state transitions are defined centrally.
- [ ] Terminal calls cannot move backward because of old events.
- [ ] Attempt numbers are correct.
- [ ] Final patient-level outcome is unambiguous.
- [ ] Idempotency behavior is tested.
- [ ] Partial/incomplete calls have defined outcomes.

---

# 10. Real telephony provider

- [ ] Production does not use the sandbox provider for live patients.
- [ ] Real provider adapter is implemented.
- [ ] Provider credentials are securely stored.
- [ ] Provider API calls use timeouts.
- [ ] Retryable and non-retryable errors are distinguished.
- [ ] Ambiguous network failures are handled without blindly duplicating calls.
- [ ] Rate-limit behavior is handled.
- [ ] Invalid phone-number responses are handled.
- [ ] No-answer is handled.
- [ ] Busy is handled.
- [ ] Voicemail policy is defined where relevant.
- [ ] Call cancellation/termination behavior is defined where relevant.
- [ ] Provider outage runbook exists.

---

# 11. Provider webhooks

- [ ] Official provider signature verification is implemented.
- [ ] Missing/invalid signatures are rejected.
- [ ] Duplicate event IDs are safe.
- [ ] Replayed events are handled where provider semantics require it.
- [ ] Malformed payloads do not crash the service.
- [ ] Unknown call events are handled safely.
- [ ] Out-of-order events do not corrupt call state.
- [ ] Raw patient-sensitive webhook bodies are not written to ordinary logs.
- [ ] Provider webhook tests run automatically.

---

# 12. Voice runtime

- [ ] Real phone audio reaches the voice runtime.
- [ ] Speech recognition is connected.
- [ ] Partial and final transcripts are distinguished.
- [ ] Text-to-speech is connected.
- [ ] Patient interruption/barge-in is handled.
- [ ] Silence timeout is handled.
- [ ] Repeated misunderstanding is handled.
- [ ] Low-confidence important speech is handled.
- [ ] Patient hangup is handled.
- [ ] Provider disconnect is handled.
- [ ] AI timeout is handled.
- [ ] Safe closing/fallback behavior exists.
- [ ] Voice latency is measured.

---

# 13. AI boundary

- [ ] AI responsibilities are documented.
- [ ] AI is not the owner of permissions.
- [ ] AI is not the owner of patient opt-out state.
- [ ] AI is not the owner of final escalation persistence.
- [ ] Important model output uses a validated structure.
- [ ] Malformed output is rejected safely.
- [ ] Confidence/uncertainty behavior is defined.
- [ ] Tool/action calls are allowlisted and validated.
- [ ] Prompt-injection tests exist.
- [ ] Unsupported medical-advice behavior is defined.
- [ ] Prompt/model version is recorded where needed for traceability.

---

# 14. Safety policy

- [ ] Safety categories are documented.
- [ ] High-priority deterministic checks exist where appropriate.
- [ ] AI classification is structured and validated where used.
- [ ] Safety actions are application-owned.
- [ ] Routine callback request is distinguished from urgent escalation.
- [ ] Opt-out is distinguished from ordinary conversation.
- [ ] Wrong-person/identity uncertainty behavior is defined.
- [ ] AI uncertainty has a safe path.
- [ ] Medical-advice boundary has approved wording.
- [ ] Safety evaluation suite passes.
- [ ] Client/clinical stakeholders have reviewed in-scope safety workflows.

---

# 15. Escalations

- [ ] Escalations are durable database records.
- [ ] Each escalation has patient and source-call relationship.
- [ ] Priority is stored.
- [ ] Reason is stored.
- [ ] Relevant evidence is available.
- [ ] Assignment is supported.
- [ ] Acknowledgment is supported where required.
- [ ] Resolution is supported.
- [ ] Resolution reason/note policy is defined.
- [ ] Resolved-by user is recorded.
- [ ] Routing success/failure is stored.
- [ ] Routing failure keeps the escalation open.
- [ ] Urgent escalation tests pass end to end.
- [ ] The patient is never falsely told that a human accepted the case when no human did.

---

# 16. Care-team dashboard

- [ ] Voice dashboard reads real backend data, not fixed sample patient data.
- [ ] Today queue exists or equivalent operational queue is available.
- [ ] Urgent work is visually prioritized.
- [ ] Routine follow-up is visible.
- [ ] Retry-exhausted work is visible.
- [ ] System/configuration blockers are visible.
- [ ] Loading states are clear.
- [ ] Empty states are clear.
- [ ] Error states are clear.
- [ ] Stale data is not presented as fresh without indication.
- [ ] Permission-specific UI states are correct.

---

# 17. Patient 360

- [ ] Staff can find a patient quickly.
- [ ] Staff can see callability/communication state.
- [ ] Staff can see current program and next schedule.
- [ ] Staff can see call history.
- [ ] Staff can see open escalations.
- [ ] Staff can see relevant resolved history.
- [ ] Staff can understand why a patient was skipped or blocked.
- [ ] Sensitive fields follow permissions.

---

# 18. Call detail

- [ ] Call session is clear.
- [ ] Attempts are clear.
- [ ] Current/final status is understandable.
- [ ] Program version is visible to authorized users.
- [ ] Transcript state is clear.
- [ ] Structured answers are visible.
- [ ] Safety triggers are visible.
- [ ] Escalation relationship is visible.
- [ ] Provider errors are translated into useful user language.
- [ ] Authorized technical detail is available for support/debugging.
- [ ] Recording access is protected if enabled.

---

# 19. Client onboarding

- [ ] Organization can be created through a controlled process.
- [ ] Staff users can be invited.
- [ ] Roles can be assigned.
- [ ] Calling policy can be configured without code changes.
- [ ] Escalation route can be configured.
- [ ] Care program can be selected/configured.
- [ ] Patient data can be imported.
- [ ] Import errors are explained row by row.
- [ ] Test patients can be clearly distinguished.
- [ ] Test calls can be run.
- [ ] Launch-blocking configuration is visible.
- [ ] Go-live activation is permission-protected and audited.

---

# 20. Data import

- [ ] CSV schema/template is documented.
- [ ] File size and row limits are defined.
- [ ] Required fields are validated.
- [ ] Duplicate rules are defined.
- [ ] Invalid phone numbers are identified.
- [ ] Timezone issues are identified.
- [ ] Import preview exists.
- [ ] User can correct/exclude bad rows.
- [ ] Import is organization-scoped.
- [ ] Import is audited.
- [ ] Test data cannot accidentally be mistaken for live patient data.

---

# 21. Reports and analytics

- [ ] Scheduled metric is defined.
- [ ] Attempted metric is defined.
- [ ] Reached metric is defined.
- [ ] Completed metric is defined.
- [ ] Retry-exhausted metric is defined.
- [ ] Escalation metric is defined.
- [ ] Acknowledgment/resolution times are defined.
- [ ] Opt-out metric is defined.
- [ ] Metrics exclude/include test data according to written rules.
- [ ] Metric calculations have tests.
- [ ] Report permissions are enforced.
- [ ] Exports are audited.

---

# 22. Audit history

- [ ] Audit model is canonical.
- [ ] Actor identity is stored.
- [ ] Organization is stored.
- [ ] Action type is stored.
- [ ] Resource type/id is stored.
- [ ] Timestamp is stored.
- [ ] Sensitive actions are covered.
- [ ] Ordinary users cannot edit audit history.
- [ ] Audit search/filter is available to authorized roles or through support tooling.
- [ ] Historical users remain identifiable after account deactivation.

---

# 23. Privacy and sensitive data

- [ ] Data-minimization review completed.
- [ ] Raw transcripts are excluded from ordinary application logs.
- [ ] Phone numbers are excluded from ordinary application logs.
- [ ] Recording URLs are excluded from ordinary application logs.
- [ ] Sensitive data is not unnecessarily placed in URLs.
- [ ] Production data is not copied into local development without an approved process.
- [ ] Support screenshots/processes avoid unnecessary sensitive data.
- [ ] Exported files have controlled access and lifecycle.

---

# 24. Encryption and secrets

- [ ] HTTPS/TLS is enabled for production user traffic.
- [ ] Database connection security is configured appropriately.
- [ ] Storage encryption is configured appropriately.
- [ ] Backup encryption is configured appropriately.
- [ ] Production secrets are not committed to Git.
- [ ] Provider secrets are not sent to the browser.
- [ ] Secrets can be rotated.
- [ ] Secret access is limited to required services/users.

---

# 25. Recording and transcript policy

- [ ] Recording is explicitly enabled or disabled.
- [ ] Required disclosure/consent review is complete.
- [ ] Recording access permissions are defined.
- [ ] Recording retention is defined.
- [ ] Transcript retention is defined.
- [ ] Deletion process is defined.
- [ ] Recording/transcript access is audited where required.
- [ ] Permanent public recording links do not exist.

---

# 26. Data retention

- [ ] Patient-data retention policy is defined.
- [ ] Transcript retention policy is defined.
- [ ] Recording retention policy is defined.
- [ ] Operational-log retention policy is defined.
- [ ] Audit retention policy is defined.
- [ ] Export retention policy is defined.
- [ ] Backup retention policy is defined.
- [ ] Automated retention/deletion jobs exist where required.
- [ ] Deletion jobs are tested.
- [ ] Retention changes are permission-protected and audited.

---

# 27. Automated testing

- [ ] Unit tests cover scheduling rules.
- [ ] Unit tests cover call state transitions.
- [ ] Unit tests cover consent/opt-out.
- [ ] Unit tests cover safety rules.
- [ ] PostgreSQL integration tests exist.
- [ ] API tests exist.
- [ ] Permission/tenant tests exist.
- [ ] Telephony adapter tests exist.
- [ ] Webhook tests exist.
- [ ] Voice scenario tests exist.
- [ ] Browser end-to-end tests cover critical staff journeys.
- [ ] AI evaluation suite exists.
- [ ] The normal test command or CI covers newer voice/job/service modules.

---

# 28. Continuous integration

- [ ] Pull requests automatically install dependencies.
- [ ] Lint runs.
- [ ] Typecheck runs.
- [ ] Unit tests run.
- [ ] Integration tests run.
- [ ] Build runs.
- [ ] Security/dependency checks run.
- [ ] Required checks block unsafe merge.
- [ ] Main branch is protected according to project policy.

---

# 29. Staging

- [ ] Staging environment exists.
- [ ] Staging configuration is documented.
- [ ] Staging uses safe test data.
- [ ] Database migrations run in staging first.
- [ ] Provider integration can be tested safely.
- [ ] Staging smoke tests exist.
- [ ] Staging version is identifiable.

---

# 30. Production deployment

- [ ] Production deployment is automated or fully documented/repeatable.
- [ ] Deployment does not depend on an undocumented developer laptop procedure.
- [ ] Production version is identifiable.
- [ ] Migrations are controlled.
- [ ] Secrets are loaded securely.
- [ ] Post-deployment smoke tests exist.
- [ ] Rollback procedure exists.
- [ ] Emergency call-pause control exists.

---

# 31. Observability

- [ ] Structured application logs exist.
- [ ] Correlation IDs exist.
- [ ] Call session/attempt IDs appear in safe operational logs.
- [ ] Provider event IDs are traceable.
- [ ] API latency/error metrics exist.
- [ ] Worker metrics exist.
- [ ] Telephony metrics exist.
- [ ] Voice latency/failure metrics exist.
- [ ] Escalation routing metrics exist.
- [ ] Care-team operations metrics exist.
- [ ] Dashboards are available to the responsible operations team.

---

# 32. Alerting

- [ ] Database outage alert exists.
- [ ] Scheduler failure alert exists.
- [ ] Telephony provider degradation alert exists.
- [ ] Webhook failure alert exists.
- [ ] Voice/AI service degradation alert exists.
- [ ] Urgent escalation-routing failure alert exists.
- [ ] Abnormal duplicate-call rate alert exists.
- [ ] Alert ownership is documented.
- [ ] Alerts do not unnecessarily expose patient-sensitive information.

---

# 33. Backup and recovery

- [ ] Automated backups exist.
- [ ] Backup access is restricted.
- [ ] Backup retention is configured.
- [ ] Restore procedure is documented.
- [ ] Restore has been tested successfully.
- [ ] Recovery time was measured.
- [ ] RTO is defined.
- [ ] RPO is defined.
- [ ] Database outage runbook exists.

---

# 34. Incident response

- [ ] Incident severity levels are defined.
- [ ] Engineering/operations contact path is defined.
- [ ] Telephony outage runbook exists.
- [ ] Voice/AI outage runbook exists.
- [ ] Scheduler outage runbook exists.
- [ ] Duplicate-call incident runbook exists.
- [ ] Escalation-routing failure runbook exists.
- [ ] Credential compromise runbook exists.
- [ ] Sensitive-data-in-logs runbook exists.
- [ ] Failed-deployment runbook exists.
- [ ] Client communication responsibility is defined.

---

# 35. Security review

- [ ] Dependency vulnerabilities reviewed.
- [ ] Secret scan clean.
- [ ] Authorization/tenant test suite green.
- [ ] Webhook verification reviewed against provider documentation.
- [ ] Common web security review completed.
- [ ] Prompt-injection/tool-abuse review completed.
- [ ] External penetration/security assessment completed when required for intended client use.
- [ ] Findings have owners and remediation status.

---

# 36. Client support

- [ ] Client knows how to report a problem.
- [ ] Client has safe correlation/reference IDs for support.
- [ ] Support process discourages unnecessary sharing of sensitive screenshots/data.
- [ ] Support access policy exists.
- [ ] Temporary elevated support access is audited where used.
- [ ] Open production issues have ownership.

---

# 37. External review decisions

The project team should not mark these complete without the appropriate stakeholder.

- [ ] Legal/compliance review completed for intended outreach/consent use.
- [ ] Call-recording requirements reviewed if recording is enabled.
- [ ] Data-retention requirements reviewed.
- [ ] Vendor/provider contract/security requirements reviewed.
- [ ] Clinical stakeholders approved care-program questions and escalation rules.
- [ ] Client approved what the automated system tells patients during escalation/failure.
- [ ] Required agreements with vendors/clients are in place for the intended data flow.

---

# 38. Client acceptance tests

The client or designated product owner has witnessed and approved at least:

- [ ] routine completed test call,
- [ ] no-answer/retry test,
- [ ] callback-request test,
- [ ] opt-out test,
- [ ] wrong-number/identity-safe test,
- [ ] synthetic escalation test,
- [ ] escalation acknowledgment/resolution,
- [ ] patient history review,
- [ ] report review,
- [ ] system-degraded-state explanation.

---

# 39. Launch approval

Before live activation, record:

- [ ] client organization,
- [ ] approved care program/version,
- [ ] approved patient cohort,
- [ ] launch date/time,
- [ ] responsible product owner,
- [ ] responsible client owner,
- [ ] responsible operations owner,
- [ ] feature flag/go-live state,
- [ ] known accepted limitations,
- [ ] rollback/pause owner.

---

# 40. Post-launch review

Within the initial controlled rollout, review:

- [ ] call connection rate,
- [ ] completion rate,
- [ ] retries,
- [ ] technical failure rate,
- [ ] escalation volume,
- [ ] false/missed escalation findings from human review,
- [ ] opt-outs,
- [ ] patient complaints/support issues,
- [ ] latency,
- [ ] provider cost,
- [ ] AI cost,
- [ ] care-team usability feedback,
- [ ] unresolved security/operations issues.

Do not expand the patient cohort merely because the first few calls succeeded.

---

# 41. Final readiness decision

Use one of these explicit outcomes.

## NOT READY

One or more blocking requirements remain unresolved.

## CONTROLLED PILOT READY

The system is approved for a narrowly defined pilot with documented limitations, approved synthetic/real-data boundary, monitoring, support, and rollback.

## CLIENT PRODUCTION READY FOR DEFINED USE CASE

The complete checklist applicable to the defined use case is satisfied, required stakeholders have approved their areas, operations can support the service, and the product can be safely paused/recovered.

Do not use the phrase `production ready` without also stating **production ready for what exact use case and operating conditions**.
