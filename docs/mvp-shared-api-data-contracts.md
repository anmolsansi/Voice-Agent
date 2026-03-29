# MVP Shared API and Data Contracts

Task: VA-F1-T02
Status: Drafted from frozen MVP schema
Source of truth input: `docs/mvp-field-schema-freeze.md`

## Purpose
These contracts define the implementation-facing shapes shared across:
- SWE1 backend APIs and persistence adapters
- SWE2 patient intake UI
- SWE3 voice extraction handoff
- SWE4 staff queue/detail surfaces

## Conventions
- IDs are strings unless noted otherwise.
- Timestamps use ISO 8601 UTC strings.
- Field keys must match the schema freeze exactly.
- Required-field enforcement happens server-side.
- `completionState` enum: `empty` | `in_progress` | `complete` | `incomplete_required`

---

## 1) Intake Session Shape

```ts
export type IntakeSessionStatus =
  | 'active'
  | 'ready_for_review'
  | 'submission_blocked'
  | 'submitted'
  | 'expired';

export type IntakeSourceMode = 'manual' | 'voice' | 'hybrid';

export interface IntakeSession {
  id: string;
  publicSessionId: string;
  status: IntakeSessionStatus;
  sourceMode: IntakeSourceMode;
  startedAt: string;
  updatedAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  completionSummary: {
    totalFields: number;
    completedFields: number;
    incompleteRequiredFields: number;
  };
  sections: IntakeSectionState[];
}

export interface IntakeSectionState {
  key: 'demographics' | 'visit_reason' | 'consent';
  label: string;
  completionState: 'empty' | 'in_progress' | 'complete' | 'incomplete_required';
  requiredFields: string[];
  incompleteRequiredFields: string[];
}
```

---

## 2) Field Save/Update Payloads

```ts
export interface SaveFieldValueRequest {
  sessionId: string;
  fieldKey: string;
  value: string | number | boolean | null;
  source: 'manual' | 'voice' | 'staff';
  clientRequestId?: string;
}

export interface SaveFieldValueResponse {
  sessionId: string;
  field: IntakeFieldState;
  validation: FieldValidationResult;
  section: IntakeSectionState;
  sessionStatus: IntakeSessionStatus;
}

export interface IntakeFieldState {
  fieldKey: string;
  value: string | number | boolean | null;
  displayValue?: string | null;
  completionState: 'empty' | 'in_progress' | 'complete' | 'incomplete_required';
  lastUpdatedAt: string;
  lastUpdatedBySource: 'manual' | 'voice' | 'staff' | 'system';
}
```

---

## 3) Validation Response Shape

```ts
export interface FieldValidationResult {
  fieldKey: string;
  isValid: boolean;
  code:
    | 'ok'
    | 'required_missing'
    | 'invalid_format'
    | 'invalid_value'
    | 'conditional_required'
    | 'server_rejected';
  message: string | null;
  blocking: boolean;
}

export interface SessionValidationSummary {
  sessionId: string;
  isSubmittable: boolean;
  incompleteRequiredFields: string[];
  invalidFields: string[];
  fieldResults: FieldValidationResult[];
}
```

---

## 4) Review Payload

```ts
export interface IntakeReviewPayload {
  session: IntakeSession;
  sections: ReviewSection[];
  validation: SessionValidationSummary;
}

export interface ReviewSection {
  key: 'demographics' | 'visit_reason' | 'consent';
  label: string;
  fields: ReviewField[];
}

export interface ReviewField {
  fieldKey: string;
  label: string;
  value: string | number | boolean | null;
  displayValue: string | null;
  required: boolean;
  completionState: 'empty' | 'in_progress' | 'complete' | 'incomplete_required';
  validationMessage: string | null;
}
```

---

## 5) Submission Response

```ts
export interface SubmitIntakeRequest {
  sessionId: string;
  signatureName: string;
}

export interface SubmitIntakeResponse {
  sessionId: string;
  status: 'submitted' | 'submission_blocked';
  submittedAt: string | null;
  submissionId: string | null;
  validation: SessionValidationSummary;
}
```

---

## 6) Staff Queue / Detail Payloads

```ts
export interface StaffQueueItem {
  sessionId: string;
  patientDisplayName: string;
  dateOfBirth: string | null;
  chiefComplaintPreview: string | null;
  status: IntakeSessionStatus;
  sourceMode: IntakeSourceMode;
  startedAt: string;
  submittedAt: string | null;
  incompleteRequiredFieldsCount: number;
}

export interface StaffQueueResponse {
  items: StaffQueueItem[];
  total: number;
}

export interface StaffIntakeDetailResponse {
  session: IntakeSession;
  patient: {
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: string | null;
    phone: string | null;
    email: string | null;
  };
  visit: {
    chiefComplaint: string | null;
    symptomDuration: string | null;
    painPresent: boolean | null;
    painScore: number | null;
    feverPresent: boolean | null;
    injuryRelated: boolean | null;
    workRelatedInjury: boolean | null;
  };
  consent: {
    treatmentConsent: boolean | null;
    hipaaAcknowledgment: boolean | null;
    financialResponsibility: boolean | null;
    signatureName: string | null;
    signedAt: string | null;
  };
  validation: SessionValidationSummary;
}
```

---

## 7) Voice Extraction Handoff Shape

```ts
export interface VoiceExtractionHandoff {
  sessionId: string;
  utteranceId: string;
  transcriptText: string;
  extractedFields: VoiceExtractedField[];
  unresolvedRequiredFields: string[];
  promptContext?: {
    activeSection: 'demographics' | 'visit_reason' | 'consent' | null;
    expectedFieldKey: string | null;
  };
}

export interface VoiceExtractedField {
  fieldKey: string;
  value: string | number | boolean | null;
  confidence: number;
  needsConfirmation: boolean;
}
```

---

## Contract Notes by Lane

### SWE1
Implement APIs and persistence using these shapes as the canonical request/response contracts.

### SWE2
Bind manual intake UI, review screen, and autosave states to these contracts; do not invent alternate payload shapes.

### SWE3
Emit extraction payloads using `VoiceExtractionHandoff` and `VoiceExtractedField`; do not write directly to persistence models.

### SWE4
Use queue/detail payloads as the initial display contract and avoid assuming additional dashboard fields before backend support exists.

## Unlock Decision
Once this artifact is accepted, the next implementation lanes safely unlocked are:
- SWE1: VA-F0-T08 / VA-F0-T07 / VA-F1-T03 / VA-F1-T04 against the frozen contracts
- SWE2: VA-F1-T06 / VA-F1-T07 / VA-F1-T08 can proceed against the frozen schema/contracts
- SWE3: prompt/extraction mapping can proceed against `VoiceExtractionHandoff`
- SWE4: queue/detail contract prep can align to `StaffQueueResponse` / `StaffIntakeDetailResponse`
