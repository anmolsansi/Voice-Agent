# Foundation repair

Scope: synthetic data, one clinic per deployment, app-owned accounts, simulated calls only.
Baseline: branch `feat/staff-foundation-repair` from `ceb8fc0`; Node 25.8.1, npm 11.11.0.
The parent checklist is the source of implementation status; unchecked means not fully verified.

## Checklist

- [x] 01 Locked dependencies and runtime inventory
- [x] 02 Baseline checks
- [x] 03 Runtime route/caller inventory
- [x] 04 Fresh migration order
- [x] 05 Repository context corrected
- [ ] 06 Staff user schema
- [ ] 07 Hashed session schema
- [ ] 08 Bounded scrypt password handling
- [ ] 09 Admin bootstrap
- [ ] 10 Account persistence validation
- [ ] 11 Login
- [ ] 12 Session lookup and expiry
- [ ] 13 Logout/revocation
- [ ] 14 Persistent throttling
- [ ] 15 Session failure tests
- [ ] 16 Admin user management
- [ ] 17 Disable and revoke
- [ ] 18 Reset and password change
- [ ] 19 Last-admin concurrency invariant
- [ ] 20 Management/recovery tests
- [ ] 21 Email/password UI
- [ ] 22 Session forwarding and CSRF
- [ ] 23 Intake/PDF/report protection
- [ ] 24 Calls and scheduler protection
- [ ] 25 Bypass and legacy-token tests
- [ ] 26 Patient/schedule foreign keys
- [ ] 27 Attempt/detail linkage
- [ ] 28 Durable synthetic seed
- [ ] 29 Lifecycle projection
- [ ] 30 Migration/relationship tests
- [ ] 31 Duplicate route/error path
- [ ] 32 Attempt input contract
- [ ] 33 Detail write contract/callers
- [ ] 34 Input and actor validation
- [ ] 35 API contract tests
- [ ] 36 State transition map
- [ ] 37 Creation idempotency
- [ ] 38 Locked attempt allocation
- [ ] 39 Atomic audit/state writes
- [ ] 40 Concurrency/replay/failure tests
- [ ] 41 Authoritative missing-record reads
- [ ] 42 Fail-closed persistence
- [ ] 43 Atomic detail persistence
- [ ] 44 Server-owned enqueue inputs
- [ ] 45 Restart/outage/rollback/enqueue tests
- [ ] 46 Explicit test commands
- [ ] 47 CI
- [ ] 48 Browser regressions
- [ ] 49 Operations/rollback docs
- [ ] 50 Final acceptance evidence

## Evidence

Before dependency installation: fixture validation passed; ordinary tests could not load dependencies.
No production deployment, real calls, real patient data, or commercial readiness is implied.

Baseline: 22/22 tests passed; lint passed with pre-existing radio aria warning; typecheck/build passed. Both 004 migrations apply in filename order. npm audit reports 14 inherited vulnerabilities (including a critical Next.js advisory); dependency remediation is a release blocker, not silently included in this foundation change.
Tracking: https://github.com/anmolsansi/Voice-Agent/issues/33
