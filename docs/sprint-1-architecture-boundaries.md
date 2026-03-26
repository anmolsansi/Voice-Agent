# Sprint 1 Architecture Boundaries and Lane Ownership

Task: VA-F0-T01
Status: Drafted for Sprint 1 kickoff

## Goal
Establish hard ownership boundaries so each lane can move in parallel without file collisions, hidden dependencies, or premature cross-layer coupling.

## System Boundaries

### 1) Patient Frontend Boundary — SWE2
Owns the patient-facing Next.js application for manual and hybrid intake.

**Scope**
- app shell, routes, layouts, section flows
- field/input primitives and section UIs
- client-side form state, validation display, autosave UX states
- manual/voice toggle UX and patient review/submit screens
- tablet/mobile responsive behavior and kiosk-safe session reset UX

**Consumes**
- shared schema/contracts from Staff SWE
- intake session and field APIs from SWE1
- voice UI/state contracts from SWE3

**Must not own**
- database schema/migrations
- server-side validation source of truth
- PHI logging implementation
- staff dashboard UX
- speech provider integrations

### 2) Backend/Core Services Boundary — SWE1
Owns the source of truth for persistence, validation enforcement, submission, and audit persistence.

**Scope**
- Postgres migrations and schema
- backend app structure/modules
- intake session lifecycle APIs
- save/update/reload/submit APIs
- server-side validation enforcement and submission gate
- audit log persistence scaffold and read/write models
- staff/dashboard read models exposed by API

**Consumes**
- MVP field schema and shared contracts from Staff SWE

**Must not own**
- patient UI components/routes
- speech UX/orchestration logic
- staff dashboard presentation layer

### 3) Voice Layer Boundary — SWE3
Owns the voice interaction surface and mapping pipeline up to structured field payloads.

**Scope**
- microphone capture UI states
- provider abstraction for STT/TTS/LLM-compatible adapters
- voice state model and orchestration draft
- prompt/extraction mapping aligned to frozen MVP schema
- transcript/extraction payloads sent through shared contracts
- hybrid fallback handoff back to manual input

**Consumes**
- field schema/contracts from Staff SWE
- save/update APIs from SWE1
- patient shell integration points from SWE2

**Must not own**
- persistence schema
- backend validation/source-of-truth rules
- staff dashboard surfaces
- final RBAC/audit policy

### 4) Staff Dashboard Boundary — SWE4
Owns internal staff-facing queue/detail/review surfaces.

**Scope**
- staff shell, routing, and navigation
- intake queue/detail UI shells
- queue/detail rendering against backend read models
- review/edit presentation workflows once backend support exists
- staff-side status badges, search/filter UX, PDF access surfaces

**Consumes**
- backend read models and contracts from SWE1/Staff SWE

**Must not own**
- backend submission/read-model business logic
- patient intake flow
- voice capture/orchestration
- auth policy definition itself

### 5) Cross-Cutting Control Boundary — Staff SWE
Owns standards, contracts, and dependency control.

**Scope**
- architecture boundaries and task sequencing
- branch/PR/merge protocol
- PHI-safe logging/redaction standard
- RBAC role/access matrix
- frozen MVP schema and generated contracts
- cross-lane review for compatibility and dependency enforcement

**Must not become a bottleneck on**
- implementation details already delegated to a lane once standards are locked

## Shared Contract Rules
- MVP field schema is the single source of truth for field IDs, labels, requiredness, value shape, validation hints, and completion states.
- Generated shared contracts are the only approved interface between frontend, backend, voice, and staff lanes.
- No lane may invent ad hoc payloads once VA-F1-T02 is complete.

## Dependency Guardrails
- SWE2 section work (VA-F1-T06/07/08) cannot start until VA-F1-T01 schema freeze is complete.
- SWE1 core DB schema (VA-F0-T07) starts only after VA-F0-T06 baseline and must align with frozen MVP schema.
- SWE4 real queue integration depends on SWE1 read models and API shape.
- SWE3 cannot move into full orchestration before provider abstraction and state model are reviewed.

## File/Code Ownership Guidance

### Likely SWE1-owned areas
- `backend/`
- `server/`
- `db/`
- `migrations/`
- API route handlers and service modules

### Likely SWE2-owned areas
- `app/(patient)/`
- `components/patient/`
- `components/forms/`
- patient-side hooks/state adapters

### Likely SWE3-owned areas
- `components/voice/`
- `lib/voice/`
- provider adapters and voice state models

### Likely SWE4-owned areas
- `app/(staff)/`
- `components/staff/`
- queue/detail presentation components

### Staff SWE-owned artifacts
- `docs/architecture/`
- `docs/security/`
- `contracts/` or generated shared types root
- standards/ADR-style docs

## Sprint 1 Starting Sequence by Lane
- Staff SWE: VA-F0-T01 → VA-F0-T02 → VA-F0-T04 → VA-F0-T05 → VA-F1-T01 → VA-F1-T02
- SWE1: VA-F0-T06 → VA-F0-T08 → VA-F0-T07 → VA-F0-T09
- SWE2: VA-F0-T10 → VA-F0-T11 → VA-F0-T12; hold F1 section builds until schema freeze
- SWE3: VA-F0-T13 → VA-F0-T14 → prep mapping against frozen schema
- SWE4: VA-F0-T15 → VA-F0-T16 → prep queue/detail contract assumptions for review

## Definition of Done for VA-F0-T01
- lane boundaries documented
- ownership by subsystem is explicit
- key dependency gates are explicit
- CEO can route work without ambiguity
