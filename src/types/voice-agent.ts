export type ConsentStatus = "granted" | "revoked" | "pending" | "unknown";
export type RiskLevel = "low" | "medium" | "high";
export type ScheduleCadence = "daily" | "weekly" | "biweekly" | "monthly";
export type ScheduleStatus = "active" | "paused" | "ended";
export type CallStatus =
  | "scheduled"
  | "initiated"
  | "ringing"
  | "answered"
  | "completed"
  | "no_answer"
  | "busy"
  | "voicemail"
  | "failed"
  | "canceled";
export type CallDisposition =
  | "completed"
  | "callback_requested"
  | "escalated"
  | "opted_out"
  | "no_answer"
  | "voicemail"
  | "failed"
  | "abandoned";
export type Speaker = "agent" | "patient" | "system";
export type EscalationPriority = "low" | "medium" | "high" | "urgent";
export type EscalationStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "dismissed"
  | "reopened";
export type ConversationStateName =
  | "greeting"
  | "identity_verification"
  | "consent"
  | "question_sequence"
  | "clarification"
  | "callback_request"
  | "escalation"
  | "summary"
  | "completion"
  | "termination";
export type ConversationIntent =
  | "affirm"
  | "deny"
  | "affirm_consent"
  | "refuse_consent"
  | "routine_status"
  | "symptom_report"
  | "urgent_symptom"
  | "callback_request"
  | "repeat"
  | "opt_out"
  | "transfer"
  | "unknown";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "care_operator" | "clinician" | "viewer";
}

export interface CareProgram {
  id: string;
  name: string;
  description: string;
  defaultCadence: ScheduleCadence;
  supportedLanguages: string[];
  escalationPolicy: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  timeZone: string;
  preferredLanguage: string;
  consentStatus: ConsentStatus;
  riskLevel: RiskLevel;
  careProgramId: string;
  assignedUserId: string;
  notes?: string;
  archivedAt?: string;
}

export interface CheckInSchedule {
  id: string;
  patientId: string;
  cadence: ScheduleCadence;
  status: ScheduleStatus;
  timeZone: string;
  windowStart: string;
  windowEnd: string;
  nextRunAt?: string;
  pausedAt?: string;
  maxAttempts: number;
}

export interface TranscriptTurn {
  id: string;
  callSessionId: string;
  speaker: Speaker;
  text: string;
  confidence?: number;
  intent?: string;
  stateBefore?: string;
  stateAfter?: string;
  startedAt: string;
  endedAt: string;
}

export interface CallSession {
  id: string;
  patientId: string;
  scheduleId?: string;
  providerCallId?: string;
  status: CallStatus;
  disposition?: CallDisposition;
  startedAt?: string;
  endedAt?: string;
  attemptNumber: number;
  failureReason?: string;
  transcriptTurnIds: string[];
  escalationIds: string[];
}

export interface Escalation {
  id: string;
  patientId: string;
  callSessionId: string;
  transcriptTurnId?: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  reason: string;
  assignedUserId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ConversationState {
  callSessionId: string;
  currentState: ConversationStateName;
  previousState?: ConversationStateName;
  retryCount: number;
  maxRetries: number;
  identityConfirmed: boolean;
  consentGranted: boolean;
  capturedSlots: {
    symptoms?: string;
    severity?: "none" | "mild" | "moderate" | "urgent";
    callbackRequested?: boolean;
    preferredCallbackWindow?: string;
    notes?: string;
  };
  disposition?: CallDisposition;
}
