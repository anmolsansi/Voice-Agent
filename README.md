# Voice-Agent for Urgent Care Intake

An interactive web application for urgent care centers to collect patient intake information using a **voice agent** with a seamless **manual fill fallback**.

## Vision

Reduce front-desk friction and improve intake completion quality by letting patients complete forms conversationally while still allowing staff/patients to edit any field manually.

---

## Core Product Goals

1. Collect complete, structured intake data quickly.
2. Support both voice-first and manual-first users.
3. Enforce required fields before submission.
4. Keep UX simple for kiosk/tablet/phone scenarios.
5. Build with HIPAA-oriented architecture from day one.

---

## Primary User Flows

### 1) Voice-First Intake
1. Patient opens intake session.
2. Voice agent asks guided questions.
3. Answers are transcribed and mapped into structured fields in real time.
4. Required fields are validated immediately.
5. If missing/invalid, agent reprompts until valid or manual fallback.
6. Patient reviews summary and submits.

### 2) Manual-First Intake
1. Patient fills fields manually.
2. Voice helper can be enabled per section.
3. Validation and required-field rules remain identical.

### 3) Hybrid Mode
- Patient can switch between voice/manual at any moment.
- Any field can be edited manually, even if populated via voice.

---

## Required-Field Enforcement (Hard Rule)

For every required field:
1. Ask question.
2. Validate answer.
3. If invalid or empty, reprompt with clearer guidance.
4. Retry up to configurable max attempts (default: 3).
5. If still unresolved:
   - mark as `incomplete_required`
   - block final submission
   - prompt manual entry to proceed

Submission is blocked until all required fields are complete and valid.

---

## MVP Feature Set

- Voice intake + manual fallback
- Dynamic conditional questions
- Real-time validation
- Required-field retry loop
- Review + confirmation screen
- Basic staff view for submitted intake
- Audit trail for field edits/events
- Kiosk-safe session timeout
- English language support (Spanish next)

---

## Planned Architecture

### Frontend
- Next.js (React)
- TailwindCSS
- Form state + validation engine
- Realtime transcript panel + field highlights

### Backend
- Node.js / Next.js API routes (or NestJS if expanded)
- Intake session orchestration
- Validation + state machine for required fields
- Submission + audit logging

### Data
- PostgreSQL
- Tables for patients, intake_sessions, responses, validation_events, audit_logs

### Voice Layer
- STT (speech-to-text)
- TTS (text-to-speech)
- LLM/intent parser for field extraction and disambiguation

---

## Security & Compliance Baseline

> This project is intended for healthcare intake workflows and should be deployed with HIPAA requirements in mind.

- Encryption in transit (TLS)
- Encryption at rest
- No PHI in application logs
- Role-based access control for staff
- Session timeout and auto-reset for shared kiosk devices
- Vendor review + BAA requirements for cloud/voice providers

---

## Engineering Work Plan

### Phase 0: Project Setup
- Repository scaffolding
- CI setup
- Environment and secret management
- Initial docs and architecture decision records

### Phase 1: Manual Intake Foundation
- Core data schema
- Form UI (manual)
- Required/optional field model
- Validation rules

### Phase 2: Voice Agent Integration
- Voice interaction loop
- Transcript + mapping engine
- Required-field retry policy
- Hybrid mode switching

### Phase 3: Submission & Staff Tools
- Review/submit gate
- Staff-side intake list/detail
- Audit timeline per intake

### Phase 4: Hardening & Pilot Readiness
- Security hardening
- Reliability testing
- Accessibility checks
- Pilot deployment and feedback loop

---

## PR Policy

- One feature/theme per PR
- Clear scope, screenshots/logs, and test notes
- Required review before merge
- Keep PRs incremental and easy to review

---

## Immediate Next PRs (Planned)

1. `feat/project-scaffold`
2. `feat/intake-schema-and-validation`
3. `feat/manual-intake-ui`
4. `feat/voice-intake-loop`
5. `feat/required-field-retry-enforcement`
6. `feat/review-submit-gate`
7. `feat/staff-dashboard-v1`
8. `feat/audit-logging-security-hardening`

---

## Status

✅ Initial planning merged.
✅ Project scaffold merged.
🚧 Intake schema + validation in progress on `feat/intake-schema-and-validation`.
