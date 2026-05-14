# Conversation Design

## Supported Intents

- `affirm`: patient confirms a yes/no prompt.
- `deny`: patient rejects a yes/no prompt.
- `affirm_consent`: patient confirms identity and agrees to continue.
- `refuse_consent`: patient does not consent to the check-in.
- `routine_status`: patient reports no new concerns.
- `symptom_report`: patient reports a non-urgent symptom or concern.
- `urgent_symptom`: patient reports severe or emergency language.
- `callback_request`: patient asks for human follow-up.
- `repeat`: patient asks the agent to repeat.
- `opt_out`: patient asks to stop future calls.
- `transfer`: patient asks for a human.
- `unknown`: intent cannot be classified with enough confidence.

## Script Path

1. Greeting: identify CheckIn Care and the reason for the call.
2. Identity verification: confirm the patient is the intended recipient.
3. Consent: ask whether the patient agrees to continue the check-in.
4. Question sequence: ask configured care-program questions.
5. Clarification: retry unclear answers up to the configured limit.
6. Callback or escalation: capture human follow-up needs.
7. Summary: recap captured outcome.
8. Completion: close the call and persist the disposition.

## Safety Boundaries

The agent must not diagnose symptoms, recommend medication changes, provide treatment instructions, or claim emergency services have been contacted. Urgent or unsupported medical content should move to escalation with safe fallback language.

## Dispositions

- `completed`: routine check-in finished.
- `callback_requested`: patient requested human follow-up.
- `escalated`: urgent symptom or safety issue was detected.
- `opted_out`: patient opted out or refused consent.
- `no_answer`: call was not answered.
- `voicemail`: provider detected voicemail or answering machine.
- `failed`: provider or runtime failed.
- `abandoned`: patient hung up before a final outcome.
