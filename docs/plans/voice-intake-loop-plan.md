# Voice Intake Loop PR Foundation

Planned next PR: `feat/voice-intake-loop`

## Goal
Introduce voice loop scaffolding that maps transcript segments into intake field updates and retry outcomes.

## Proposed initial scope
1. Voice session interface stubs (start/stop/pause)
2. Transcript event shape and mapping contract
3. Field extraction adapter with confidence metadata
4. Retry outcome bridge (`reprompt`, `manual_required`, `complete`) aligned to backend state machine
5. Tests for transcript mapping edge cases

## Dependencies
- Uses field keys from manual intake + backend schema (`first_name`, `last_name`, `date_of_birth`, `phone`, `insurance_member_id`, `chief_complaint`, `symptom_summary`)
- Uses retry-state semantics from backend PR #3

## Out of scope
- Live STT/TTS vendor integration
- Persistent storage wiring for voice events
