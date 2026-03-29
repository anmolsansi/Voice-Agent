# Voice state model draft

This module defines the **frontend-facing voice interaction state model** for CheckIn Care.

Scope intentionally stays narrow:
- defines the supported voice states
- documents allowed transitions
- provides a pure reducer-style transition helper
- exposes simple UI metadata for later patient-facing screens

Out of scope for this draft:
- microphone lifecycle orchestration
- speech provider wiring
- timers / retries / backoff
- full conversation flow logic

## States

- `idle`
- `listening`
- `transcribing`
- `confirming`
- `clarification`
- `manual_required`
- `error`

## Typical flow

```text
idle
  -> listening
  -> transcribing
  -> confirming
  -> idle
```

If speech is unclear:

```text
transcribing
  -> clarification
  -> listening
```

If voice cannot continue safely:

```text
<any active state>
  -> manual_required
```

If the voice stack fails:

```text
<any active state>
  -> error
```

## Integration notes

- Keep a single `VoiceStateSnapshot` in component/store state.
- Dispatch app events into `transitionVoiceState(currentState, event)`.
- Render UI affordances using `state.status` and `getVoiceUiState(state)`.
- Persist transcript/confirmation text outside this module if product flows need longer-lived intake data.

## Suggested event mapping

- STT started -> `START_LISTENING`
- Interim/final transcript chunk worth processing -> `TRANSCRIPT_RECEIVED`
- NLU/extraction produced a patient-facing confirmation prompt -> `TRANSCRIPTION_COMPLETED`
- Transcript confidence too low / incomplete answer -> `TRANSCRIPTION_UNCLEAR`
- Patient confirms answer -> `CONFIRMATION_ACCEPTED`
- Patient rejects answer -> `CONFIRMATION_REJECTED`
- UI requests retry -> `CLARIFICATION_REQUESTED`
- User or app switches to manual flow -> `MANUAL_FALLBACK_REQUESTED`
- Provider/runtime failure -> `ERROR_OCCURRED`
- Step ends / session resets -> `RESET`
