# Testing, Observability, and Deployment

## Purpose

A product can look correct during a demo and still fail badly in production.

This document explains how CheckIn Care should prove that the product works, detect when it stops working, release changes safely, and recover when something goes wrong.

Three words are important:

- **Testing** means checking expected behavior before and during release.
- **Observability** means collecting enough information to understand what the running system is doing and why it failed.
- **Deployment** means the controlled process of moving a tested version of the software into an environment where users can access it.

The current repository has useful tests and operational ideas, but the complete voice product needs a much broader quality system before it should support real client operations.

---

# 1. Why one successful demo is not enough

Suppose a developer runs one test call and everything works.

That proves only one path under one set of conditions.

A real product also has to handle:

- patient does not answer,
- patient hangs up,
- wrong person answers,
- provider sends duplicate webhook,
- provider sends events out of order,
- AI returns invalid data,
- database is temporarily unavailable,
- scheduler runs twice,
- user lacks permission,
- client imports bad data,
- deployment contains a migration error,
- transcript arrives late,
- escalation notification fails.

Production quality means these cases are designed and tested, not discovered for the first time with a real patient.

---

# 2. Test pyramid

Different tests answer different questions.

The project should use several layers rather than relying on one giant end-to-end test suite.

---

# 3. Unit tests

A unit test checks one small rule or function in isolation.

Examples for CheckIn Care:

## Scheduling

- schedule is due at the correct time,
- inactive patient is skipped,
- opted-out patient is skipped,
- retry limit is enforced,
- call outside allowed window is delayed,
- rescheduled call uses requested allowed time.

## Call state

- queued can move to starting,
- starting can move to ringing,
- completed cannot move back to ringing,
- failed terminal attempt cannot be restarted accidentally.

## Consent

- active consent allows configured channel,
- revoked consent blocks future calls,
- wrong-number state blocks calls.

## Safety

- configured phrase triggers expected rule,
- similar harmless phrase does not trigger false rule,
- human callback request creates routine action,
- opt-out is classified correctly.

## Reporting

- completion rate uses the written metric definition,
- retries do not accidentally count as separate patients when the report is patient-based.

Unit tests should be fast and numerous.

---

# 4. Database integration tests

An integration test checks multiple real components together.

Database integration tests should use real PostgreSQL behavior rather than only mocked functions.

Important tests:

- insert patient and retrieve patient,
- organization A cannot retrieve organization B patient through service query,
- deleting/retiring records preserves required relationships,
- unique idempotency constraint prevents duplicate work,
- transaction rollback leaves no partial records,
- scheduler concurrency does not claim the same work twice,
- call session and attempts maintain correct relationships,
- escalation remains connected to source call,
- audit event stores correct actor/resource identifiers.

A **transaction** is a group of database changes that should either all succeed or all fail together.

Example:

If creating a call requires both a call session and first attempt, the product should not leave a half-created session if the second database operation fails.

---

# 5. API tests

An API test sends requests to the backend and checks the response.

For each sensitive resource, test more than the successful case.

Example patient detail route:

## Success

Authorized user from correct organization receives patient.

## 401 Unauthorized

No valid login/session.

## 403 Forbidden

Logged-in user lacks required permission.

## 404 Not Found

Patient does not exist or should not be revealed across tenant boundary.

## 422 Validation Error

Request data is invalid.

## 409 Conflict

Requested action conflicts with current state, where appropriate.

## 429 Too Many Requests

Rate limit applies where appropriate.

The exact status code policy should be standardized and documented.

---

# 6. Permission tests

Permission tests deserve their own category because healthcare/client data leakage is a major risk.

Required examples:

- care coordinator cannot manage organization users,
- read-only user cannot update patient,
- non-admin cannot change safety policy,
- user from Organization A cannot access Organization B patient,
- user from Organization A cannot access Organization B transcript,
- user from Organization A cannot export Organization B report,
- internal support without approved access cannot open patient-sensitive content.

These tests should run automatically.

---

# 7. Telephony adapter tests

Keep the sandbox provider and use it heavily in tests.

Test:

- successful call creation,
- provider timeout,
- provider rejects phone number,
- provider authentication failure,
- ambiguous network failure,
- cancellation,
- rate limit response,
- retryable error,
- permanent error.

The application should know which errors may be retried safely.

---

# 8. Webhook tests

A production webhook implementation needs tests for:

- valid signature,
- invalid signature,
- missing signature,
- malformed JSON/body,
- duplicate event,
- replayed event where applicable,
- event for unknown call,
- old event after terminal state,
- events arriving in unexpected order,
- provider retry after application timeout.

Expected rule:

A duplicate valid event should normally be safe and should not duplicate business actions.

---

# 9. Voice scenario tests

The voice product needs deterministic conversation scenarios.

A scenario defines:

- simulated patient utterances,
- expected conversation state,
- expected structured output,
- expected safety decision,
- expected final outcome.

Example:

```text
Scenario: routine callback request

System: "Would you like someone from the care team to call you?"
Patient: "Yes, please call me this afternoon."

Expected intent: callback_requested
Expected escalation priority: routine
Expected call outcome: completed_with_followup
Expected unsafe medical advice: none
```

---

# 10. AI evaluation suite

AI behavior can change when:

- prompt changes,
- model version changes,
- provider changes,
- temperature/settings change,
- context format changes.

Therefore maintain a fixed evaluation set.

Recommended scenarios:

1. routine answer,
2. ambiguous answer,
3. patient changes previous answer,
4. patient asks medical advice,
5. patient requests human,
6. patient opts out,
7. wrong person answers,
8. urgent configured signal,
9. misleading non-urgent phrase that should not escalate,
10. low-confidence transcript,
11. prompt-injection attempt,
12. AI returns malformed output,
13. AI timeout,
14. repeated misunderstanding,
15. caregiver answers where workflow does not allow continuation.

Track at least:

- intent accuracy,
- structured-field accuracy,
- escalation recall,
- false escalation rate,
- unsupported-advice rate,
- schema-valid output rate,
- latency.

---

# 11. What escalation recall means

**Recall** asks:

> Of the situations that truly should have escalated, how many did the system actually escalate?

Missing a required escalation can be more serious than creating some extra routine review work.

The acceptable balance must be determined with client/clinical input and validated with representative scenarios.

---

# 12. End-to-end tests

An end-to-end test follows the full product journey.

Minimum end-to-end scenarios:

## Happy path

```text
Create test patient
-> enroll in program
-> schedule becomes due
-> worker creates call
-> mocked provider answers
-> voice scenario completes
-> structured result stored
-> dashboard shows completed call
```

## No answer

```text
Call attempt 1 no answer
-> retry scheduled
-> attempt 2 no answer
-> retry policy exhausted
-> staff work item created if configured
```

## Urgent escalation

```text
Patient gives configured concerning response
-> safety policy triggers
-> escalation created
-> queue displays item
-> staff acknowledges
-> staff resolves
-> audit history records actions
```

## Opt-out

```text
Patient asks to stop calls
-> opt-out persisted
-> future schedule suppressed
-> dashboard reflects status
-> audit event recorded
```

## Permission denial

```text
Organization A user requests Organization B call
-> access denied
-> no sensitive data returned
```

---

# 13. Browser end-to-end tests

Use a browser automation tool for important staff and admin journeys.

Examples:

- login,
- patient import preview,
- patient search,
- open call detail,
- assign escalation,
- resolve escalation,
- configure program draft,
- run test-call workflow,
- export approved report.

Do not try to automate every pixel. Focus on business-critical journeys.

---

# 14. Accessibility testing

Accessibility means people with disabilities can use the product.

Check:

- keyboard navigation,
- visible focus,
- labels for form controls,
- screen-reader-friendly headings,
- sufficient contrast,
- clear error messages,
- touch-target size,
- not relying only on color for urgency.

The care-team interface may be used during busy clinical operations, so clarity benefits everyone.

---

# 15. Performance testing

The first client does not require internet-scale load testing, but we should test realistic volumes.

Examples:

- patient list with thousands of records,
- call-history pagination,
- many due schedules in one worker run,
- burst of provider webhook events,
- report generation over a large date range.

Measure actual behavior before adding complex scaling infrastructure.

---

# 16. Continuous integration

Continuous integration, or CI, automatically checks code changes.

A pull request should not depend on a reviewer remembering every local command.

Recommended CI pipeline:

```text
Install dependencies
-> lint
-> typecheck
-> unit tests
-> database integration tests
-> API/permission tests
-> build
-> dependency/security checks
```

Voice/evaluation suites can run in an appropriate deterministic mode and heavier suites may be separated if they take longer.

---

# 17. Branch protection

The main production branch should be protected.

Recommended policy:

- changes through pull request,
- required CI checks,
- review for meaningful production changes,
- no force push to main,
- migration changes receive explicit review.

This reduces accidental production breakage.

---

# 18. Environments

## Local development

Purpose:

- fast engineering work,
- sandbox providers,
- synthetic data.

## CI test environment

Purpose:

- automated isolated tests,
- disposable test database.

## Staging

Purpose:

- test deployed behavior before production,
- verify migrations,
- verify provider integration with approved test configuration,
- run smoke tests.

## Production

Purpose:

- real client operation,
- strict access,
- real monitoring,
- backups,
- controlled release.

---

# 19. Deployment pipeline

Recommended sequence:

```text
Pull request approved
-> merge to main
-> automated build artifact
-> deploy to staging
-> migration validation
-> staging smoke tests
-> production approval
-> deploy production
-> production smoke tests
-> monitor release
```

A **build artifact** is the packaged version of the application that will be deployed. Reusing the same tested artifact reduces surprises between staging and production.

---

# 20. Database migration deployment

Database migrations can cause serious outages if mishandled.

For every production migration:

- understand whether it locks large tables,
- avoid destructive changes before code stops depending on old fields,
- backfill safely,
- test on representative data,
- record migration version,
- define recovery plan.

Prefer backward-compatible migrations during multi-step releases.

Example:

1. add new nullable column,
2. deploy code that writes both old and new values,
3. backfill old records,
4. switch reads to new value,
5. later remove old column after confidence.

---

# 21. Smoke tests

A smoke test is a short test run after deployment to confirm that the most important functions work.

Production smoke checks should use safe test/synthetic records where possible.

Examples:

- health endpoint healthy,
- login works,
- database read/write test passes through approved health mechanism,
- dashboard loads,
- test organization can create safe test call where allowed,
- webhook endpoint accepts verified synthetic provider event,
- escalation queue loads.

---

# 22. Observability

Observability means the team can understand the internal state of the running system from its outputs.

Main tools include:

- logs,
- metrics,
- traces/correlation identifiers,
- audit events,
- health checks.

---

# 23. Structured logs

A structured log uses fields rather than one giant text message.

Example:

```json
{
  "event": "call_attempt_failed",
  "callAttemptId": "ca_123",
  "provider": "telephony_provider",
  "errorCode": "PROVIDER_TIMEOUT",
  "retryable": true,
  "requestId": "req_456"
}
```

Do not include raw patient-sensitive content.

---

# 24. Metrics

Metrics are numerical measurements collected over time.

## API metrics

- request count,
- error rate,
- response latency.

## Database metrics

- connection usage,
- query latency,
- errors.

## Worker metrics

- due schedules found,
- calls created,
- calls skipped,
- worker failures,
- queue delay.

## Telephony metrics

- call request success,
- connection success,
- no answer,
- busy,
- provider failure.

## Voice metrics

- speech-recognition latency,
- AI latency,
- text-to-speech latency,
- total conversational turn latency,
- low-confidence turns,
- repeated clarification.

## Care-operation metrics

- completed check-ins,
- open escalations,
- time to acknowledgment,
- time to resolution,
- retries exhausted,
- opt-outs.

---

# 25. Alerting

Monitoring without alerting requires someone to stare at dashboards all day.

Alerts should notify the responsible operations/engineering team when a meaningful condition occurs.

Examples:

- telephony provider errors above threshold,
- scheduler has not run successfully,
- database unavailable,
- webhook failures increasing,
- urgent escalation routing failure,
- queue backlog unusually high,
- deployment error rate spike.

Avoid sending alerts for every single normal patient no-answer event. That is business data, not necessarily a system incident.

---

# 26. Service-level objectives

An SLO is a measurable reliability target.

Potential pilot targets should be validated rather than assumed.

Examples:

- API availability,
- webhook processing success,
- duplicate-call rate,
- scheduler delay,
- escalation-routing success,
- dashboard response time.

Clinical/operational response expectations should be separated from technical SLOs.

---

# 27. Dashboards for engineers versus care teams

Do not force care-team users to read engineering monitoring dashboards.

## Engineering dashboard

May show:

- CPU,
- memory,
- HTTP latency,
- database pool,
- provider errors,
- worker queue.

## Care-team operations dashboard

Should show:

- calling healthy/degraded,
- scheduled calls,
- affected calls,
- escalation routing healthy/degraded,
- user-actionable data problems.

Different audiences need different detail.

---

# 28. Backup strategy

A production database needs automatic backups.

Decide:

- backup frequency,
- retention,
- encryption,
- access,
- geographical/storage policy,
- point-in-time recovery support where available.

But creating backups is only half the requirement.

---

# 29. Restore testing

Regularly prove that backups can be restored.

A restore test should answer:

- can the backup be downloaded/accessed,
- can a new database be created from it,
- does the application start against restored data,
- are key record counts and relationships correct,
- how long did recovery take?

Document results.

---

# 30. Recovery objectives

## Recovery Time Objective (RTO)

How long can the product be unavailable before restoration is expected?

## Recovery Point Objective (RPO)

How much recent data loss is acceptable after a disaster?

Example concept:

If the RPO is 15 minutes, the backup/recovery design should aim to lose no more than approximately 15 minutes of committed data in the defined disaster scenario.

Exact objectives should match client expectations and infrastructure capability.

---

# 31. Runbooks

A runbook is a written incident procedure.

Required runbooks should eventually include:

- telephony provider outage,
- voice/AI provider outage,
- database outage,
- scheduler stopped,
- duplicate-call incident,
- escalation-routing failure,
- leaked credential,
- failed production deployment,
- sensitive data discovered in logs.

A new engineer on call should be able to follow the document without relying on tribal knowledge.

---

# 32. Rollback

A rollback returns the product to a previously safe state after a bad release.

Possible rollback methods:

- revert application version,
- disable new feature flag,
- switch provider adapter,
- pause outbound calling,
- apply forward database repair.

Database migrations make rollback more complicated, which is why destructive migrations should be staged carefully.

---

# 33. Emergency stop controls

For a product that automatically calls patients, the operations team needs a clear emergency stop.

Possible controls:

- disable all outbound calls platform-wide,
- disable one organization,
- disable one care program,
- pause one patient,
- disable one provider integration.

The action should be permission-protected and audited.

---

# 34. Release monitoring

After production deployment, actively compare key metrics to the pre-release baseline.

Watch:

- errors,
- latency,
- call initiation,
- provider failures,
- webhook failures,
- worker lag,
- escalation creation/routing,
- unusual opt-out or abandonment changes.

A release is not finished at the moment the deployment command succeeds.

---

# 35. Production definition of done

A ticket that changes production behavior is not complete until appropriate parts of this list are satisfied:

- code implemented,
- unit tests,
- integration/API tests,
- permission tests,
- failure behavior,
- logging/metrics,
- migration safety if relevant,
- documentation updated,
- manual QA where useful,
- CI green,
- staging validation,
- rollback/feature-flag plan for higher-risk change.

---

# 36. What we should add to this repository next

The current repository should add a real CI workflow that runs the relevant application checks.

The existing test command should be expanded so newer `.mjs` voice, provider, job, safety, and service code cannot quietly avoid the normal test suite.

Then the project should add:

1. database integration test setup,
2. API/auth/tenant test harness,
3. deterministic telephony provider mocks,
4. voice scenario fixtures,
5. browser end-to-end tests,
6. security checks,
7. deployment smoke checks.

---

# 37. Quality principle

The correct production question is not:

> Did the feature work once?

It is:

> Can we prove the important paths work, detect when they do not, recover safely, and explain the result to the people operating the product?
