# Care-Team and Urgent-Care Workflows

## Purpose

This file explains how CheckIn Care should be used by the people who actually perform patient-outreach work.

It focuses on real operational questions:

- What does a care coordinator do when they start their shift?
- What does a nurse see when a patient reports something concerning?
- What does an administrator configure before the first call?
- What happens when the patient does not answer?
- What happens when the wrong person answers?
- What happens when the automated system is uncertain?
- What should an urgent-care follow-up workflow look like?

The exact medical and legal workflow must be approved by the client. This document describes a product operating model, not medical advice.

---

# 1. People involved

## Patient

The patient receives the check-in call.

The patient should be able to complete the interaction without understanding the technology behind it.

The patient experience should be:

- short,
- clear,
- respectful,
- easy to stop,
- easy to reschedule,
- honest about being automated,
- honest about what happens when help is requested.

## Care coordinator

The care coordinator is often the main daily user.

They should be able to:

- monitor scheduled outreach,
- review missed or failed calls,
- assign follow-up,
- review routine escalations,
- update patient communication status,
- reschedule appropriate outreach,
- document completed follow-up.

## Nurse or clinician

The nurse or clinician may review selected escalations.

They should receive enough information to understand why the item reached them without reading every line of every call.

They may need:

- patient summary,
- reason for escalation,
- relevant transcript section,
- structured answers,
- time of the call,
- prior related calls,
- previous follow-up notes.

## Care manager

The care manager supervises the workflow.

They need to know:

- how much work is open,
- how old unresolved escalations are,
- whether the team is meeting internal response expectations,
- whether many patients are failing to connect,
- whether a care program is producing too many false alarms,
- whether system problems are creating manual work.

## Organization administrator

The administrator configures the product.

They should control:

- users,
- roles,
- patient import,
- call windows,
- care programs,
- escalation routing,
- approved settings,
- data retention,
- provider-related configuration that is appropriate to expose.

## CheckIn Care support

Internal support helps diagnose product problems.

Support access to patient data should be restricted. A support employee should not automatically have permanent access to all client records.

---

# 2. What an urgent-care use case could mean

"Urgent care" is not one universal workflow.

A clinic might use CheckIn Care for follow-up after an urgent-care visit.

Example:

A patient visits urgent care for a non-emergency condition. The clinic wants to contact the patient the next day or two days later to check whether the patient is improving and whether the patient needs human follow-up.

The automated system is not replacing the urgent-care clinician.

It is doing routine outreach that may otherwise require many manual calls.

---

# 3. Example urgent-care follow-up program

## Program name

`48-Hour Urgent-Care Follow-Up`

## Goal

Contact a patient after an urgent-care visit, collect a small approved set of follow-up answers, and route any concerning or unclear situation to a human.

## Example timing

- first call 24 to 48 hours after the visit,
- retry if no answer according to clinic policy,
- stop retries when the maximum attempt count is reached,
- do not call outside approved hours.

The exact timing must be client configurable.

## Example patient questions

The clinic may approve questions such as:

1. Is now a good time for a short follow-up?
2. Are you feeling better, about the same, or worse than when you visited?
3. Are you having any new or worsening symptoms that the clinic wants this program to ask about?
4. Were you able to follow the discharge instructions you received?
5. Do you want someone from the care team to call you?

The actual wording and medical scope must be reviewed by the client.

## Example outcomes

- completed, no follow-up needed,
- routine callback requested,
- concerning response requiring review,
- patient unavailable,
- patient asked to be called later,
- wrong person/wrong number,
- patient opted out,
- no answer after retry limit,
- system failure requiring manual review.

---

# 4. Daily care-team workflow

A good product should organize work around what the team needs to do today.

## Start-of-shift view

When a care coordinator signs in, the first screen should answer:

### What requires attention now?

Examples:

- urgent escalations,
- old unresolved escalations,
- failed calls that require manual outreach,
- patients with invalid contact information.

### What is scheduled today?

Examples:

- calls due this morning,
- calls due this afternoon,
- retry calls,
- paused calls waiting for action.

### Is the system healthy?

Examples:

- telephony provider healthy,
- scheduler healthy,
- AI service healthy,
- webhook processing healthy.

The user should not need to open a technical monitoring system for basic operational health.

---

# 5. Suggested Today screen

A practical layout could be:

```text
TODAY

Urgent review                  3
Routine follow-up              8
Retry exhausted                5
Blocked by data/configuration  2
Upcoming calls                27

-------------------------------------------------
URGENT
Maria Garcia
Reason: worsening symptoms reported
Age: 6 minutes
Owner: Unassigned
[Review]

ROUTINE FOLLOW-UP
Robert Patel
Reason: patient requested callback
Age: 21 minutes
Owner: Jordan Lee
[Open]

RETRY EXHAUSTED
Sam Wilson
3 call attempts completed without contact
[Review patient]
```

The screen should rank work, not simply display charts.

---

# 6. Routine completed call workflow

## Step 1: patient answers

The system confirms that the interaction can proceed according to the clinic's approved workflow.

## Step 2: questions are asked

The system follows the current published care-program version.

## Step 3: answers are captured

Answers are stored as structured data.

The transcript may also be stored according to the organization's policy.

## Step 4: safety rules are checked

If no follow-up condition is triggered, the system can complete the check-in.

## Step 5: staff view

The care team can see:

- patient,
- completed time,
- program,
- structured result,
- summary,
- whether any safety rule triggered,
- next planned check-in.

Routine calls should not create unnecessary manual work.

---

# 7. Routine callback request workflow

A patient may say:

> Can someone call me later?

The system should not treat this as an error.

## Expected behavior

1. detect callback request,
2. confirm the request,
3. create a routine escalation or callback task,
4. record relevant context,
5. tell the patient only what the clinic has approved the system to promise,
6. show the task in the care-team queue,
7. track ownership and resolution.

## Bad behavior

Do not say:

> A nurse will definitely call you in ten minutes.

unless the client has a real staffed process that guarantees that response.

---

# 8. Patient asks to be called later

This is different from requesting a human callback.

Example:

> I am at work. Can you call me this evening?

## Expected behavior

The system should offer approved choices such as:

- later today,
- tomorrow,
- a specific allowed time window.

Then:

- update the schedule,
- record who requested the change,
- ensure the new time is within policy,
- avoid counting the original interaction as a normal failed attempt if the program defines it as a reschedule.

---

# 9. No-answer workflow

No answer is normal in outbound calling.

It must be a first-class product state.

## Attempt 1

The provider reports no answer.

The system records:

- attempt number,
- provider reason,
- time,
- next allowed retry.

## Retry policy

The care program defines:

- maximum attempts,
- spacing between attempts,
- allowed hours,
- whether different time windows should be tried.

## Retry exhausted

After the allowed attempts are used:

- stop automated retries,
- mark the session accordingly,
- create a staff-visible item if the program requires manual follow-up,
- do not continue calling indefinitely.

---

# 10. Busy signal workflow

A busy result should usually be retryable.

The product should distinguish it from:

- invalid phone,
- permanent provider error,
- opt-out,
- completed call.

This matters because not every failure deserves the same next action.

---

# 11. Voicemail workflow

Voicemail behavior should be an explicit program decision.

Possible policies:

- leave no message,
- leave an approved generic callback message,
- leave a program-specific message that contains no inappropriate sensitive information,
- count voicemail as an attempt and schedule a retry.

The clinic must approve the wording.

The system should never invent voicemail content dynamically without constraints.

---

# 12. Wrong person answers

This is a privacy-sensitive case.

The system should avoid revealing unnecessary patient information.

## Expected behavior

If identity cannot be appropriately established:

1. do not continue the patient-specific check-in,
2. do not reveal the reason for the patient's care,
3. mark the outcome as wrong person or identity not confirmed,
4. create a data-review task if required,
5. decide whether the phone number should be marked questionable.

The exact identity-confirmation method requires client and compliance review.

---

# 13. Wrong number

A person may say:

> You have the wrong number. Stop calling here.

## Expected behavior

- stop the patient-specific conversation,
- record wrong-number status,
- suppress further automated calls to that number,
- create a staff task to correct contact information where appropriate,
- audit the change.

A wrong-number report should be treated more seriously than one missed call.

---

# 14. Opt-out workflow

A patient may say:

> Stop calling me.

## Expected behavior

1. recognize the opt-out,
2. confirm in plain language,
3. update communication eligibility,
4. cancel or pause future automated check-ins according to policy,
5. record date, source, and related call,
6. create an audit event,
7. show the new state on the patient profile.

Future automation should check this state before creating a call.

---

# 15. Concerning response workflow

A concerning response is a situation where the organization's approved safety policy says a human must review the interaction.

## Example

The patient reports language matching a configured high-priority condition.

## Expected automated behavior

1. identify the safety condition,
2. avoid unsupported medical advice,
3. follow the clinic-approved safety wording,
4. stop or adjust the normal script if required,
5. create a durable urgent escalation,
6. preserve the supporting evidence,
7. route the escalation to the configured queue,
8. record whether routing succeeded.

## Human behavior

A care-team member:

1. opens the escalation,
2. sees why it triggered,
3. reviews the relevant call evidence,
4. acknowledges the item,
5. takes the client-approved human action,
6. records the resolution.

The system should track time from creation to acknowledgment and resolution.

---

# 16. Human escalation is unavailable

This is one of the most important failure cases.

Suppose the system detects a condition that should route to a human, but:

- the notification service fails,
- the configured escalation destination is invalid,
- no staff member is currently assigned,
- the downstream integration is unavailable.

## Required system behavior

The product should:

- keep the escalation open,
- mark routing as failed,
- generate an operational alert,
- use an approved fallback route if one exists,
- never mark the escalation completed automatically.

The patient should not be told that a human has accepted the case unless that is true.

---

# 17. Patient asks a medical question

The patient may ask:

> Should I take another dose?

or

> Does this mean I have an infection?

The automated check-in product should not improvise medical advice.

## Expected behavior

The application should use approved language such as:

- explain that the automated check-in cannot provide that medical decision,
- offer or create human follow-up according to program policy,
- record the request.

The exact wording must be clinically and legally reviewed for the intended use.

---

# 18. Patient becomes confused

Some patients may not understand the automated call.

The system should support:

- repeating the question,
- simpler approved wording,
- keypad fallback for simple choices,
- offering a human callback,
- safely ending the automated flow after repeated failures.

It should not endlessly repeat the same sentence.

---

# 19. Low-confidence speech recognition

Speech recognition may be uncertain.

Example:

The system thinks the patient said:

`"No chest pain"`

but confidence is low.

For an important field, the product should not silently store the uncertain interpretation.

## Better behavior

Ask:

> Just to confirm, did you say you are not having chest pain?

If the answer remains unclear:

- mark the field uncertain,
- create review if required,
- avoid pretending the answer is known.

---

# 20. Patient interrupts the system

People interrupt naturally.

A real voice product should support **barge-in**.

Barge-in means the patient begins speaking while the system is still playing audio, and the application stops or lowers its current speech so it can listen.

Without this, the call feels robotic and frustrating.

The system also needs to ensure that interruption does not accidentally skip required safety or consent steps.

---

# 21. Patient changes an answer

Example:

> Actually, I said that wrong. I did miss my medication yesterday.

The system should update the structured answer while preserving enough history to explain the final result.

It should not treat the first answer as permanently correct simply because it was stored first.

---

# 22. Call disconnects mid-conversation

A patient may hang up or lose service.

## Expected behavior

Store what is safe and useful from the partial call:

- call attempt state,
- completed questions,
- partial transcript according to policy,
- whether any safety signal had already occurred.

Then decide based on the program:

- retry later,
- create human follow-up,
- mark incomplete.

If an urgent signal occurred before the disconnect, that information must not be lost just because the call did not finish normally.

---

# 23. AI provider fails mid-call

The AI service can fail.

## Expected behavior

The voice runtime should move to an approved safe state.

Possible behavior:

- use a simple fixed closing message,
- create follow-up if necessary,
- end the call cleanly,
- mark the technical failure,
- preserve completed answers,
- retry only if policy says retry is appropriate.

Do not generate random fallback advice.

---

# 24. Telephony provider fails

The telephone provider can be unavailable.

## Expected behavior

- calls that have not started remain queued or failed safely,
- the scheduler does not create uncontrolled duplicates,
- retry behavior follows a provider-outage policy,
- operations users see that the provider is degraded,
- the system records which calls were affected.

---

# 25. Patient profile workflow

A care coordinator opening a patient should see one coherent page.

Recommended sections:

## Summary

- name,
- contact state,
- active/inactive,
- consent/opt-out,
- preferred timezone/language.

## Programs

- active program,
- program version,
- enrollment date,
- next check-in.

## Open work

- urgent escalations,
- routine callbacks,
- data problems.

## Call history

- date,
- result,
- attempt count,
- escalation indicator.

## Timeline

A chronological list of important patient-outreach events.

---

# 26. Escalation queue workflow

The escalation queue is the human safety net.

## Recommended filters

- urgent/routine,
- open/acknowledged/in progress/resolved,
- assignee,
- age,
- care program,
- reason.

## Recommended row information

- patient,
- priority,
- reason,
- age,
- assigned person,
- current status.

## Opening an escalation

The user sees:

- patient summary,
- why it triggered,
- relevant transcript lines,
- structured result,
- call details,
- prior related escalations,
- action history.

## Resolving an escalation

Require:

- resolution category,
- optional/required note depending on category,
- identity of the person resolving it,
- timestamp.

Do not allow a high-priority item to disappear with one unlabeled button click.

---

# 27. Care-manager workflow

A manager should be able to answer:

- How many escalations are open?
- How many are older than our expected response window?
- Which staff members have too much assigned work?
- Which care programs are generating the most follow-up?
- Are patients answering calls?
- Are retries effective?
- Are technical failures increasing?
- Are many patients opting out?

This is operational management, not merely analytics decoration.

---

# 28. Administrator workflow

The administrator should be able to set up the product without opening source code.

## Users

- invite,
- deactivate,
- assign role,
- review last activity.

## Calling policy

- timezone,
- allowed hours,
- retry count,
- delay between retries,
- closed days.

## Escalation policy

- destinations,
- priority rules,
- fallback contact/queue,
- internal response expectations.

## Data policy

- recording enabled/disabled,
- transcript handling,
- retention choices allowed by the platform,
- export permissions.

## Care programs

- create draft,
- test,
- publish version,
- retire version.

---

# 29. Test-call workflow for client onboarding

Before real patients are called, the client should run test calls.

## Suggested process

1. create a synthetic test patient,
2. assign the care program,
3. place a test call to an approved test number,
4. answer as a routine patient,
5. review the call detail,
6. repeat with a callback-request scenario,
7. repeat with an escalation scenario,
8. confirm that staff receives the item,
9. confirm the audit history,
10. approve the program for live use.

This makes the client part of the acceptance process.

---

# 30. Product-language rules for care teams

Ordinary users should see plain language.

## Avoid

- `HTTP 500`
- `provider status failure`
- `webhook timeout`
- `intent confidence 0.62`
- `call_state=FINALIZING`

## Prefer

- `The call provider could not complete this call.`
- `We will retry automatically at 3:00 PM.`
- `The patient's answer was unclear and needs review.`
- `The transcript is still being processed.`

Technical detail can exist behind an admin/debug view.

---

# 31. What the care team should never have to do

A usable product should not require ordinary staff to:

- edit environment variables,
- restart servers,
- inspect JSON,
- run database queries,
- open GitHub,
- read application logs,
- understand AI provider model names,
- manually calculate retry eligibility,
- remember whether an unresolved alert was already handled by someone else.

If routine care-team operation requires these actions, the product is not client-ready.

---

# 32. Minimum care-team V1

For a real pilot, the minimum operational product should include:

- individual staff accounts,
- organization isolation,
- patient list,
- patient profile,
- patient import,
- consent/opt-out state,
- one versioned care program,
- scheduling,
- real outbound calls,
- safe voice workflow,
- retries,
- call history,
- call detail,
- transcript/structured result,
- escalation queue,
- assignment,
- resolution,
- audit history,
- basic analytics,
- system health indication,
- admin settings,
- test-call flow.

That is the level at which a care team can begin to depend on the product rather than simply watch a demo.
