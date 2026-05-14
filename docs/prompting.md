# Prompting

## Prompt Version

Current prompt contract: `checkin-care-v1`.

## Prompt Layers

- System prompt: fixed product role, safety boundaries, and output requirements.
- Call context: patient, care program, schedule, and active call metadata.
- State prompt: instructions for the current conversation state.
- Safety prompt: unsupported medical advice and urgent-symptom fallback behavior.
- Structured output prompt: JSON fields for intent, next state, captured slots, response text, and disposition.

## Evaluation Fixtures

Evaluation fixtures in `tests/fixtures/conversations/evaluation-fixtures.mjs` cover:

- Happy path completion.
- Callback requested.
- Opt-out.
- Urgent escalation.
- Unclear answer retry.
- Unsupported medical advice fallback.

Fixtures use synthetic data only.
