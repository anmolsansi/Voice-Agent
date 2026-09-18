# Foundation verification record

Date: 2026-09-18. Branch: `feat/staff-foundation-repair`. Parent: [#33](https://github.com/anmolsansi/Voice-Agent/issues/33).
Scope: synthetic local evaluation; no real calls, patient data, recordings or production deployment.

## Local verification

| Gate | Observed result | Evidence / reproduction |
|---|---|---|
| Locked dependency install | Passed | `npm ci`; Node25.8.1/npm11.11.0 |
| Ordinary tests | 17/17 passed | `npm test`, `/tmp/checkincare-unit-final.log` |
| PostgreSQL integration | 23/23 passed | `TEST_DATABASE_URL=<isolated-db> npm run test:integration`, `/tmp/checkincare-integration-final.log` |
| Fresh and upgrade migrations | Passed within integration suite | Separate temporary databases; both 004 files applied; orphan diagnostics and explicit detail mapping verified |
| Browser workflow | 3/3 passed | `npm run test:browser` with TEST_DATABASE_URL; `/tmp/checkincare-browser-final.log` |
| Lint | Passed, one inherited accessibility warning | `npm run lint`; radio aria-invalid in components/form-fields.tsx |
| Typecheck | Passed | `npm run typecheck` |
| Synthetic fixtures | Passed | `npm run check:voice-agent` |
| Production build | Passed | `npm run build`; `/tmp/checkincare-build-final.log` |
| Operator CLI | Passed | Temporary foundation_cli database: repeated bootstrap returns same user, recovery succeeds, unknown recovery exits1, repeated synthetic seed leaves one patient/one schedule/zero calls |
| Diff whitespace | Passed | `git diff --check` |

Integration tests now have an explicit PostgreSQL command instead of silently using memory. The original 22-test baseline and final 17 ordinary +23 integration tests are different groupings, not a loss of five tested behaviors.

The final recording regression initially exposed a fixture omission (required provider_recording_id); the fixture was corrected and the complete 23-test suite rerun successfully. An earlier sandbox EPERM prevented local HTTP binding; the same ordinary suite passed when run with localhost permission. Neither is recorded as an application defect.

## Invariants exercised

- Direct backend access with no session or legacy shared-token header is denied before protected work. care_staff cannot manage accounts or write call state.
- Absolute/idle expiry, disable, logout, reset and forced password change revoke or constrain access. Account/IP throttle windows persist in PostgreSQL.
- Concurrent last-admin changes leave an active admin; operator recovery invalidates previous sessions.
- Eight simultaneous equivalent creations produce one attempt; eight distinct requests allocate unique attempt numbers. Conflicting creation inputs return409.
- Competing terminal transitions serialize; exact replay creates no duplicate audit. Injected audit failure rolls back both creation and transition.
- Detail batches roll back on transcript ownership conflict. Concurrent public-detail IDs cannot overwrite another attempt. Historical recording URLs remain withheld.
- Pool restart preserves persisted data. Deleted rows do not return from cache. Database outage cannot become successful memory persistence.
- Migration upgrade rejects unmapped legacy rows and accepts explicit verified IDs. Neither existing004 file was renamed.
- Scheduler reads persisted schedules; submitted schedules/actor data are rejected and repeated enqueue is idempotent.

## Complete browser workflow

Chromium exercised real rendered forms: email/password login → forced password change → dashboard → logout; patient start → required fields/consent → reload → review/submit → staff login → notes and mark reviewed → PDF bytes → reload persisted review notes. Reviewed submissions remain eligible for PDF (a regression found and fixed during this work).

Separate browser assertions cover CSRF denial, expired session denial, disabled-account denial and report access. Page-error listeners report no uncaught errors on the main workflows. Desktop and 390px mobile screenshots were inspected; the synthetic banner and sign-out control remain visible, with no horizontal clipping in the mobile view.
Screenshots live in `/tmp/checkincare-browser-results`; CI uploads browser evidence separately.

## Hosted verification and deployment

Hosted CI: pending publication/run. This section must be updated from the actual GitHub Actions result; local success does not imply hosted success.

No synthetic staging destination is configured, and no staging deployment or human approval has occurred. The implementation remains on a review branch. The ten packets under `docs/tickets/Pending` document the implemented contracts and review checkpoints; their directory does not imply accepted review.

## Remaining release gates

Inherited npm audit result:14 findings (2low,2moderate,9high,1critical including Next.js). Dependency remediation remains a release blocker; this patch does not claim production security certification. Lint retains one pre-existing radio accessibility warning.
Before synthetic staging, apply compatible migrations, configure HTTPS/APP_URL/private backend/database access, bootstrap an individual admin and validate on target hardware (including scrypt memory/concurrency). Retain additive schema on rollback; do not restore unauthenticated APIs.
Real telephony requires geography/provider/language/recording/hosting/follow-up decisions and a controlled-call specification. Commercial post-visit, intake and callback releases remain incomplete until their separately agreed acceptance gates pass.
