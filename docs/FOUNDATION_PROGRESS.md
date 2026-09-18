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
- [x] 06 Staff user schema
- [x] 07 Hashed session schema
- [x] 08 Bounded scrypt password handling
- [x] 09 Admin bootstrap
- [x] 10 Account persistence validation
- [x] 11 Login
- [x] 12 Session lookup and expiry
- [x] 13 Logout/revocation
- [x] 14 Persistent throttling
- [x] 15 Session failure tests
- [x] 16 Admin user management
- [x] 17 Disable and revoke
- [x] 18 Reset and password change
- [x] 19 Last-admin concurrency invariant
- [x] 20 Management/recovery tests
- [x] 21 Email/password UI
- [x] 22 Session forwarding and CSRF
- [x] 23 Intake/PDF/report protection
- [x] 24 Calls and scheduler protection
- [x] 25 Bypass and legacy-token tests
- [x] 26 Patient/schedule foreign keys
- [x] 27 Attempt/detail linkage
- [x] 28 Durable synthetic seed
- [x] 29 Lifecycle projection
- [x] 30 Migration/relationship tests
- [x] 31 Duplicate route/error path
- [x] 32 Attempt input contract
- [x] 33 Detail write contract/callers
- [x] 34 Input and actor validation
- [x] 35 API contract tests
- [x] 36 State transition map
- [x] 37 Creation idempotency
- [x] 38 Locked attempt allocation
- [x] 39 Atomic audit/state writes
- [x] 40 Concurrency/replay/failure tests
- [x] 41 Authoritative missing-record reads
- [x] 42 Fail-closed persistence
- [x] 43 Atomic detail persistence
- [x] 44 Server-owned enqueue inputs
- [x] 45 Restart/outage/rollback/enqueue tests
- [x] 46 Explicit test commands
- [x] 47 CI
- [x] 48 Browser regressions
- [x] 49 Operations/rollback docs
- [x] 50 Final acceptance evidence

## Evidence

Before dependency installation: fixture validation passed; ordinary tests could not load dependencies.
No production deployment, real calls, real patient data, or commercial readiness is implied.

Baseline: 22/22 tests passed; lint passed with pre-existing radio aria warning; typecheck/build passed. Both 004 migrations apply in filename order. npm audit reports 14 inherited vulnerabilities (including a critical Next.js advisory); dependency remediation is a release blocker, not silently included in this foundation change.
Tracking: https://github.com/anmolsansi/Voice-Agent/issues/33

Identity checkpoint: password hashing unit test and five PostgreSQL integration scenarios pass (bootstrap, permissions, expiry/logout, concurrent last-admin protection, recovery, persistent throttling). CLI is validated further in final acceptance.

Final local implementation checkpoint:17 ordinary tests,23 PostgreSQL integration tests,3 browser scenarios, lint/typecheck/fixtures/build and CLI checks pass. See [full evidence](FOUNDATION_EVIDENCE.md), [operator guide](FOUNDATION_GUIDE.md), and [ten review packets](tickets/Pending/).

Checklist completion means implementation and local verification, not human approval, staging deployment or commercial release. Hosted CI is tracked separately in the evidence record. Microtasks vary in effort; no equal 2% estimate is claimed.
