# Client Onboarding and Daily Operations

## Purpose

A product is not client-ready just because engineers can run it.

A clinic needs a clear way to:

- get set up,
- invite staff,
- add patients,
- configure calling rules,
- test the system,
- go live,
- monitor daily work,
- understand problems,
- get support.

This document explains what that client experience should look like.

---

# 1. Onboarding should be a guided process

The first client should not receive a long technical README and be told to configure environment variables.

The product should guide an authorized administrator through a launch checklist.

Recommended stages:

1. Organization setup
2. Team setup
3. Calling policy
4. Escalation setup
5. Care program setup
6. Patient import
7. Consent/eligibility validation
8. Test calls
9. Launch review
10. Go live

The application should show progress and clearly explain what is blocking launch.

---

# 2. Organization setup

Create one client organization.

Example:

`Northside Urgent Care`

Collect only necessary business settings, such as:

- organization display name,
- primary timezone,
- approved support contact,
- operational contact,
- organization status.

Do not mix ordinary organization configuration with secrets such as provider API keys unless the product has a secure admin design for that purpose.

---

# 3. Team setup

The administrator invites staff members individually.

For each user, collect:

- name,
- email or identity-provider reference,
- role,
- active/inactive status.

The system should send a secure invitation or account-activation path.

## Admin should be able to

- invite a user,
- resend invitation where safe,
- change role,
- deactivate account,
- see last activity at a useful high level,
- revoke sessions if necessary.

## Admin should not be able to

- see another user's password,
- impersonate users without an explicit audited support/admin mechanism.

---

# 4. Calling policy setup

The organization configures when automated outreach is allowed.

Settings may include:

- default timezone,
- weekday call start time,
- weekday call end time,
- weekend behavior,
- holiday/closed-day behavior,
- maximum retry count,
- minimum time between retries,
- voicemail policy,
- caller identification configuration.

The product should explain settings in plain language.

Example:

`Maximum call attempts: 3`

Explanation:

`CheckIn Care will make no more than three automated telephone attempts for the same scheduled check-in.`

---

# 5. Escalation setup

Before the first patient is called, the system needs to know what happens when a human must review something.

Configure:

- default queue/team,
- urgent queue/team,
- operational fallback,
- notification methods,
- internal response expectations if the client uses them.

## Launch blocker

If the care program can create urgent escalations but no valid human destination exists, the program should not be allowed to go live.

---

# 6. Care program setup

The client chooses or creates the first approved workflow.

Recommended V1 approach:

Start with one or two tightly scoped templates rather than a blank unlimited builder.

Example:

- post-urgent-care follow-up,
- medication-adherence check-in.

Each program should show:

- purpose,
- eligible patients,
- schedule,
- questions,
- possible outcomes,
- escalation rules,
- retry rules,
- currently published version.

---

# 7. Draft, test, publish lifecycle

A care program should have clear states.

## Draft

The program can be edited but cannot call live patients.

## Testing

The program can be used with approved synthetic/test patients and test numbers.

## Published

The version is approved for live scheduling.

## Retired

No new patient check-ins should use this version, but historical calls still reference it.

A published version should not change silently. Editing creates a new draft version.

---

# 8. Patient import

The first practical integration should be CSV import.

CSV is a common file format that can be opened by spreadsheet programs.

## Import process

1. user uploads file,
2. system shows column mapping,
3. system validates each row,
4. system detects duplicates where possible,
5. system previews results,
6. user fixes or excludes invalid rows,
7. user confirms import,
8. system creates patient records,
9. audit event records the import.

---

# 9. Import validation

The product should classify rows.

## Valid

Ready to import.

## Needs review

Potential problem that a user can correct.

Examples:

- timezone missing,
- duplicate external ID,
- phone number looks unusual.

## Invalid

Cannot be imported until corrected.

Examples:

- missing required patient identifier,
- invalid phone,
- impossible required value.

The user should see row numbers and human explanations.

Do not fail an entire 500-row import with only `Import failed`.

---

# 10. Patient eligibility review

Importing a patient does not automatically mean the patient is eligible for automated calling.

The product should separately determine:

- active patient,
- callable phone number,
- communication permission/consent status,
- not opted out,
- program enrollment,
- required scheduling data present.

A patient may exist in the system while being marked `Not callable`.

---

# 11. Test patient concept

Every organization should have clearly marked synthetic/test patients for launch validation.

Synthetic means invented data that does not represent a real patient.

Test records should be visually marked so staff do not confuse them with live patients.

Production analytics may need to exclude test records.

---

# 12. Test-call process

Before live launch, run a controlled set of test calls.

Minimum scenarios:

## Routine completion

The tester answers all questions normally.

Expected:

- completed call,
- correct structured fields,
- no escalation,
- correct dashboard result.

## Callback request

Expected:

- follow-up task created,
- correct priority,
- visible in queue,
- auditable.

## Opt-out

Expected:

- patient becomes non-callable,
- future schedule suppressed,
- audit event recorded.

## No answer

Expected:

- attempt recorded,
- correct retry scheduled,
- no duplicate call.

## Safety/escalation test

Use an approved synthetic scenario.

Expected:

- correct safety rule,
- escalation persisted,
- routing works,
- staff can acknowledge and resolve it.

---

# 13. Launch review screen

Before enabling live calling, show a final checklist.

Example:

```text
Organization setup             Complete
Active administrators          Complete
Calling hours                  Complete
Escalation destination         Complete
Published care program         Complete
Patient import                 Complete
Consent review                 Complete
Routine test call              Passed
Opt-out test                   Passed
Escalation test                Passed
Monitoring                     Healthy
```

Any hard blocker should prevent activation.

---

# 14. Controlled go-live

Do not begin the first client with thousands of patients on day one.

Recommended rollout:

## Stage 1

Internal synthetic test patients only.

## Stage 2

Very small approved pilot group.

## Stage 3

Larger controlled patient group after reviewing results.

## Stage 4

Normal client operation.

Feature flags can control which organization or care program is allowed to place real calls.

---

# 15. Daily care coordinator workflow

A coordinator signs in and sees the Today queue.

Recommended order:

1. urgent unresolved work,
2. overdue routine follow-up,
3. system/data problems,
4. retry-exhausted patients,
5. upcoming outreach,
6. recent routine completions.

The product should focus attention on action, not make users interpret charts first.

---

# 16. Daily manager workflow

A manager needs both queue visibility and trends.

Questions they should be able to answer:

- How many calls were scheduled today?
- How many patients were reached?
- How many completed?
- How many are still retrying?
- How many escalations are open?
- How old is the oldest escalation?
- Are any technical problems blocking outreach?
- Which program has unusual failure or escalation rates?

---

# 17. Daily administrator workflow

An administrator usually should not be changing configuration every day.

They may need to:

- manage new staff,
- deactivate departing staff,
- review configuration warnings,
- update calling hours,
- review failed imports,
- publish an approved program version,
- inspect audit history.

Sensitive changes should be confirmed and audited.

---

# 18. Patient support workflow

A patient may contact the clinic and say:

- I got an automated call,
- I want calls to stop,
- the call reached the wrong number,
- I want another call,
- the call disconnected.

The care team should be able to find the patient and understand recent call history quickly.

The patient profile should support these questions without requiring an engineer to search provider logs.

---

# 19. Operational status page inside the product

Care teams do not need every engineering metric, but they do need simple dependency health.

Example:

```text
Outbound calling     Healthy
Call scheduler       Healthy
Voice service        Healthy
Transcript processing Degraded
Escalation routing   Healthy
```

If something is degraded, the product should explain the user impact.

Example:

`Calls can continue, but transcripts may appear later than usual.`

---

# 20. Configuration problems should become visible work

Examples:

- patient missing timezone,
- invalid phone number,
- no escalation destination,
- expired provider credential,
- unpublished care program,
- missing consent state.

Do not allow these problems to become invisible worker errors.

Show them in an admin/operations queue with remediation instructions.

---

# 21. Reports clients should receive

Useful reports include:

## Daily outreach report

- scheduled,
- attempted,
- reached,
- completed,
- retrying,
- failed.

## Escalation report

- created,
- open,
- acknowledged,
- resolved,
- average/median resolution time,
- reasons.

## Patient engagement report

- answer rate,
- completion rate,
- opt-out rate,
- average call duration.

## System-quality report

- provider failures,
- low-confidence calls,
- AI fallback usage,
- transcript delays.

Metric definitions must be documented.

---

# 22. Support and incident process

The client needs to know what to do when something goes wrong.

Inside the product or support documentation, explain:

- how to report a problem,
- what information to include,
- where to find a safe support/correlation code,
- what qualifies as urgent support,
- how service incidents will be communicated.

Do not ask clients to send patient-sensitive screenshots through an insecure support channel by default.

---

# 23. Internal support workflow

When support receives an issue:

1. identify organization,
2. collect safe correlation/call identifiers,
3. inspect logs/metrics without unnecessary PHI,
4. request temporary patient-data access only if needed and allowed,
5. diagnose,
6. record support action,
7. revoke/expire special access.

---

# 24. Client change management

A client may request:

- new question wording,
- new retry policy,
- new escalation rule,
- new calling hours.

Important changes should not modify active historical behavior.

Use versioning and controlled publication.

For example:

- Program v1 remains attached to old calls.
- Program v2 is tested.
- Program v2 is published.
- New scheduled calls use v2.

---

# 25. Safe program retirement

When a program is retired:

- no new enrollments,
- decide what happens to existing future schedules,
- historical call records remain readable,
- analytics preserve the version identity,
- audit event records retirement.

Do not delete the program definition and make historical calls impossible to explain.

---

# 26. Offboarding a staff member

When an employee leaves:

- deactivate account,
- revoke active sessions,
- remove privileged role,
- preserve historical audit identity,
- reassign open escalations/tasks.

Do not delete the user record in a way that makes old audit records say `Unknown User`.

---

# 27. Offboarding a client

A future commercial product needs a documented process for ending service.

Decisions include:

- stop new calls,
- revoke users,
- export data if contractually allowed,
- begin retention/deletion workflow,
- preserve required audit evidence,
- remove provider configuration,
- confirm completion.

Exact contractual and legal requirements require external review.

---

# 28. Training material

A client-ready product should eventually include short role-based guides.

Examples:

## Care Coordinator Quick Start

- sign in,
- review Today queue,
- open escalation,
- document follow-up,
- handle opt-out.

## Admin Quick Start

- invite users,
- import patients,
- configure program,
- run test call,
- publish program.

## Manager Quick Start

- monitor open work,
- review performance,
- inspect aging escalations,
- export approved report.

These should use screenshots and product language after the UI is stable.

---

# 29. What "self-service" should mean

Self-service does not necessarily mean the first client gets zero help.

A strong early product can use guided onboarding with a CheckIn Care team member.

But normal operations should not require engineering changes.

Clients should be able to manage:

- users,
- patients,
- schedules,
- approved program configuration,
- queues,
- resolutions,
- reports,
- ordinary settings.

Engineering should be needed for product changes, not daily care operations.

---

# 30. Client-ready usability test

Give the product to a new coordinator who did not build it.

After basic training, ask them to:

1. find a patient,
2. explain whether that patient is callable,
3. find the latest call,
4. explain what happened,
5. find an open escalation,
6. assign it,
7. record a resolution,
8. find a retry-exhausted patient,
9. opt out a test patient,
10. identify whether the calling provider is healthy.

If they need a developer to complete these ordinary tasks, the UI and operational design still need work.

---

# 31. First-client onboarding acceptance criteria

The onboarding feature is complete when a new client can be moved from an empty organization to a controlled live pilot using a documented process that includes:

- individual users,
- correct roles,
- configured call windows,
- configured escalation ownership,
- published program,
- validated patient import,
- validated communication status,
- successful test calls,
- successful opt-out test,
- successful escalation test,
- monitoring enabled,
- support route documented,
- launch approval recorded.
