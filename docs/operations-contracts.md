# Operations Contracts

## Patient And Schedule Screens

Patient list views should consume normalized patient records with care program, consent, risk, next run time, last call status, and open escalation count. Desktop layouts can render this as a table. Mobile layouts should render compact cards with primary status and next action first.

Patient detail views should include profile, contact preference, consent status, care program, schedule, recent calls, transcript links, and open escalations.

## Call And Transcript Views

Call detail views should receive:

- Call lifecycle status and final disposition.
- Patient and care program context.
- Ordered transcript turns.
- Timeline events.
- Recording metadata when authorized.
- Guardrail or escalation markers.

## Escalation Inbox

Escalation lists should sort urgent and open items first. Detail views should show patient context, triggering transcript excerpt, owner, notes, status actions, and audit history.

## Dashboard Summary

Dashboard summaries should include calls today, completed check-ins, no-answer calls, open escalations, upcoming calls, failed calls, and failed worker jobs.

## Operational Health

Health responses should expose dependency names and status only. Never include secrets, raw patient data, transcript text, or provider credentials in health output.
