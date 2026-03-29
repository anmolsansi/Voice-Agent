# Branch / PR / Review / Merge Protocol

Task: VA-F0-T02
Status: Approved working protocol for Sprint 1

## Purpose
Set a strict delivery protocol so all lanes ship small, reviewable changes with predictable branch naming, PR hygiene, and merge discipline.

## Branch Rules
- One task per branch.
- Branch names must include lane + task intent.
- Recommended format:
  - `feat/swe1-postgres-baseline`
  - `feat/swe2-demographics-section`
  - `feat/swe3-voice-state-model`
  - `feat/swe4-staff-queue-shell`
  - `docs/staff-mvp-contracts`
- Do not stack unrelated tasks on the same branch.
- If a task grows beyond a clean reviewable unit, split it before opening PR.

## PR Scope Rules
- One task/theme per PR.
- PR title should include task ID when available.
- Recommended title format:
  - `[VA-F0-T06] Postgres migration baseline`
  - `[VA-F1-T06] Demographics section`
- PR description must include:
  - task ID
  - summary of change
  - files/areas touched
  - tests run
  - screenshots/log samples if relevant
  - dependency notes / follow-up tasks

## Review Rules
- No self-merge without review for non-trivial implementation PRs.
- Staff SWE is the default control reviewer for cross-lane compatibility and scope discipline.
- Review checks must confirm:
  - task scope stayed bounded
  - no schema/contract drift
  - no PHI leakage in logs/examples/tests
  - no hidden coupling across lanes
  - tests/typecheck/lint noted appropriately

## Merge Rules
- Merge only when:
  - scope matches assigned task
  - review comments are resolved or explicitly deferred
  - required checks pass (when configured)
  - branch is up to date enough to merge safely
- Preferred merge style: **squash merge** for single-task clarity.
- After merge:
  1. update issue/card status
  2. attach PR link and merge commit
  3. immediately pull next unblocked task

## Work-in-Progress Rules
- Open draft PRs early when useful for visibility.
- Do not let a lane sit idle after opening a PR; next unblocked task should already be queued.
- If blocked, lane must report:
  - blocker
  - dependency owner
  - suggested next action

## Task Handoff Rules by Lane
- SWE1: must align backend shapes to frozen schema/contracts before exposing APIs
- SWE2: must not start F1 section builds before schema/contracts are locked
- SWE3: must not jump from abstraction work into full orchestration without state model review
- SWE4: must keep shell-only work separate from real data integration until read models exist

## Commit Message Guidance
Use conventional, task-scoped commit messages.

Examples:
- `feat(db): [VA-F0-T06] postgres migration baseline`
- `feat(frontend): [VA-F1-T06] demographics intake section`
- `feat(voice): [VA-F0-T14] draft voice state model`
- `docs(contracts): [VA-F1-T02] add MVP shared API and data contracts`

## Definition of Done for This Protocol
- branch naming is standardized
- PR scope/review/merge rules are explicit
- post-merge next-step rule is explicit
- lanes can operate without ambiguity during Sprint 1
