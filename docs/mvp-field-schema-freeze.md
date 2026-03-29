# MVP Field Schema Freeze

Task: VA-F1-T01
Status: Frozen for Sprint 1 MVP
Depends on: VA-F0-T01 complete
Next: VA-F1-T02 shared API/data contracts

## Scope
This schema freeze defines the minimum structured intake fields required to unlock:
- SWE1 backend session/save/update models
- SWE2 manual intake sections
- SWE3 voice prompt/extraction mapping
- SWE4 queue/detail display assumptions

This freeze is intentionally MVP-tight. It excludes long-tail medical history, insurance capture, medication lists, allergies detail trees, pharmacy preferences, and advanced triage/history branching.

## Field Design Rules
- Field keys are stable contract identifiers.
- Server-side validation remains the source of truth.
- UI may provide inline validation/help, but cannot weaken requiredness.
- Conditional fields must be omitted or null when condition is not met.
- Required fields block submission if incomplete or invalid.

## Completion States
- `empty`
- `in_progress`
- `complete`
- `incomplete_required`

## MVP Sections and Fields

### 1) Demographics / Contact Basics

| Field Key | Label | Type | Required | Conditional Rules | UI Control Type |
|---|---|---|---|---|---|
| `patient.firstName` | First name | string | required | none | text input |
| `patient.lastName` | Last name | string | required | none | text input |
| `patient.dateOfBirth` | Date of birth | date | required | none | date picker |
| `patient.sexAtBirth` | Sex at birth | enum | required | none | radio/select |
| `patient.genderIdentity` | Gender identity | string | optional | none | text input |
| `patient.phone` | Phone number | phone string | required | none | tel input |
| `patient.email` | Email address | email string | optional | none | email input |
| `patient.addressLine1` | Address line 1 | string | optional | none | text input |
| `patient.addressLine2` | Address line 2 | string | optional | none | text input |
| `patient.city` | City | string | optional | none | text input |
| `patient.state` | State | string | optional | shown/validated only when address fields are used | state select/text |
| `patient.postalCode` | ZIP code | string | optional | shown/validated only when address fields are used | text input |
| `patient.preferredLanguage` | Preferred language | enum | optional | none | select |

#### Enum notes
- `patient.sexAtBirth`: `female`, `male`, `intersex`, `prefer_not_to_say`, `self_describe`
- if `patient.sexAtBirth = self_describe`, unlock optional `patient.sexAtBirthSelfDescribe`

Additional conditional field:

| Field Key | Label | Type | Required | Conditional Rules | UI Control Type |
|---|---|---|---|---|---|
| `patient.sexAtBirthSelfDescribe` | Describe sex at birth | string | optional | only show/store if `patient.sexAtBirth = self_describe` | text input |

### 2) Visit Reason / Chief Complaint

| Field Key | Label | Type | Required | Conditional Rules | UI Control Type |
|---|---|---|---|---|---|
| `visit.chiefComplaint` | What brings you in today? | string | required | none | textarea |
| `visit.symptomDuration` | How long has this been going on? | string | optional | none | text input/select |
| `visit.painPresent` | Are you having pain? | boolean | optional | none | yes/no toggle |
| `visit.painScore` | Pain level (0-10) | integer | optional | required only if `visit.painPresent = true` | segmented control/select |
| `visit.feverPresent` | Do you have a fever? | boolean | optional | none | yes/no toggle |
| `visit.injuryRelated` | Is this related to an injury? | boolean | optional | none | yes/no toggle |
| `visit.workRelatedInjury` | Is the injury work-related? | boolean | optional | show only if `visit.injuryRelated = true` | yes/no toggle |

### 3) Consent / HIPAA Acknowledgment

| Field Key | Label | Type | Required | Conditional Rules | UI Control Type |
|---|---|---|---|---|---|
| `consent.treatmentConsent` | I consent to evaluation and treatment | boolean | required | must be `true` to submit | checkbox |
| `consent.hipaaAcknowledgment` | I acknowledge receipt/availability of HIPAA privacy practices | boolean | required | must be `true` to submit | checkbox |
| `consent.financialResponsibility` | I accept financial responsibility for services rendered | boolean | optional | none | checkbox |
| `consent.signatureName` | Signature (full name) | string | required | none | text input |
| `consent.signedAt` | Signature timestamp | datetime | required | set by system at signing/submit step | system-generated hidden |

## Minimal Validation Notes
- `patient.firstName`, `patient.lastName`: non-empty trimmed strings
- `patient.dateOfBirth`: valid past date; patient age must be plausible
- `patient.phone`: valid normalized US phone format for MVP
- `patient.email`: valid email format when present
- `visit.chiefComplaint`: non-empty trimmed string with reasonable length cap
- `visit.painScore`: integer 0-10 only when pain is present
- `consent.treatmentConsent` and `consent.hipaaAcknowledgment`: must be true before submit
- `consent.signatureName`: non-empty trimmed string
- `consent.signedAt`: server-generated/validated timestamp

## Voice/Manual Mapping Guidance
- Every field above is eligible for manual entry.
- Voice extraction may populate suggested values, but backend validation determines accepted values.
- Free-text voice capture is expected primarily for:
  - `visit.chiefComplaint`
  - `visit.symptomDuration`
  - `patient.genderIdentity`
  - `patient.sexAtBirthSelfDescribe`

## Explicitly Out of Scope for This Freeze
- insurance member/subscriber details
- emergency contact
- full medical/surgical history
- allergies and medications
- preferred pharmacy
- pregnancy screening
- travel/exposure screening
- vitals/device integrations
- staff-only review/correction fields
- transcript storage policy details

## Freeze Decision
This schema is frozen for Sprint 1 implementation. Changes require Staff SWE approval because they affect backend models, patient UI, voice extraction, and staff surfaces simultaneously.
