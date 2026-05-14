export const users = [
  {
    id: "user-care-001",
    name: "Avery Patel",
    email: "avery.patel@example.test",
    role: "care_operator"
  },
  {
    id: "user-clinician-001",
    name: "Jordan Lee",
    email: "jordan.lee@example.test",
    role: "clinician"
  }
];

export const carePrograms = [
  {
    id: "program-heart-health",
    name: "Heart Health Check-In",
    description: "Routine post-discharge symptom and medication-adherence check-ins.",
    defaultCadence: "weekly",
    supportedLanguages: ["en-US"],
    escalationPolicy: "Escalate chest pain, severe shortness of breath, fainting, or medication confusion."
  },
  {
    id: "program-diabetes",
    name: "Diabetes Wellness",
    description: "Routine check-ins for glucose monitoring, supplies, and follow-up needs.",
    defaultCadence: "biweekly",
    supportedLanguages: ["en-US"],
    escalationPolicy: "Escalate severe dizziness, confusion, fainting, or inability to access medication."
  }
];

export const patients = [
  {
    id: "patient-maria-garcia",
    firstName: "Maria",
    lastName: "Garcia",
    phoneNumber: "+14155550101",
    alternatePhoneNumber: "+14155550109",
    timeZone: "America/Los_Angeles",
    preferredLanguage: "en-US",
    consentStatus: "granted",
    riskLevel: "medium",
    careProgramId: "program-heart-health",
    assignedUserId: "user-care-001",
    notes: "Prefers afternoon calls."
  },
  {
    id: "patient-sam-wilson",
    firstName: "Sam",
    lastName: "Wilson",
    phoneNumber: "+13125550102",
    timeZone: "America/Chicago",
    preferredLanguage: "en-US",
    consentStatus: "pending",
    riskLevel: "low",
    careProgramId: "program-diabetes",
    assignedUserId: "user-care-001"
  },
  {
    id: "patient-evelyn-chen",
    firstName: "Evelyn",
    lastName: "Chen",
    phoneNumber: "+12125550103",
    timeZone: "America/New_York",
    preferredLanguage: "en-US",
    consentStatus: "granted",
    riskLevel: "high",
    careProgramId: "program-heart-health",
    assignedUserId: "user-clinician-001",
    notes: "High-priority follow-up if symptoms worsen."
  },
  {
    id: "patient-lee-brown",
    firstName: "Lee",
    lastName: "Brown",
    phoneNumber: "+15035550104",
    timeZone: "America/Los_Angeles",
    preferredLanguage: "en-US",
    consentStatus: "revoked",
    riskLevel: "low",
    careProgramId: "program-diabetes",
    assignedUserId: "user-care-001",
    archivedAt: "2026-05-01T16:00:00.000Z"
  }
];

export const checkInSchedules = [
  {
    id: "schedule-maria-weekly",
    patientId: "patient-maria-garcia",
    cadence: "weekly",
    status: "active",
    timeZone: "America/Los_Angeles",
    windowStart: "13:00",
    windowEnd: "16:00",
    nextRunAt: "2026-05-15T20:00:00.000Z",
    maxAttempts: 3
  },
  {
    id: "schedule-evelyn-weekly",
    patientId: "patient-evelyn-chen",
    cadence: "weekly",
    status: "active",
    timeZone: "America/New_York",
    windowStart: "09:00",
    windowEnd: "11:00",
    nextRunAt: "2026-05-15T13:30:00.000Z",
    maxAttempts: 3
  },
  {
    id: "schedule-lee-paused",
    patientId: "patient-lee-brown",
    cadence: "biweekly",
    status: "paused",
    timeZone: "America/Los_Angeles",
    windowStart: "10:00",
    windowEnd: "12:00",
    pausedAt: "2026-05-01T16:00:00.000Z",
    maxAttempts: 2
  }
];

export const callSessions = [
  {
    id: "call-maria-completed",
    patientId: "patient-maria-garcia",
    scheduleId: "schedule-maria-weekly",
    providerCallId: "provider-call-001",
    status: "completed",
    disposition: "completed",
    startedAt: "2026-05-08T20:02:00.000Z",
    endedAt: "2026-05-08T20:06:30.000Z",
    attemptNumber: 1,
    transcriptTurnIds: ["turn-maria-001", "turn-maria-002", "turn-maria-003"],
    escalationIds: []
  },
  {
    id: "call-sam-no-answer",
    patientId: "patient-sam-wilson",
    providerCallId: "provider-call-002",
    status: "no_answer",
    disposition: "no_answer",
    startedAt: "2026-05-09T18:00:00.000Z",
    endedAt: "2026-05-09T18:01:00.000Z",
    attemptNumber: 1,
    failureReason: "provider_no_answer",
    transcriptTurnIds: [],
    escalationIds: []
  },
  {
    id: "call-evelyn-escalated",
    patientId: "patient-evelyn-chen",
    scheduleId: "schedule-evelyn-weekly",
    providerCallId: "provider-call-003",
    status: "completed",
    disposition: "escalated",
    startedAt: "2026-05-10T14:10:00.000Z",
    endedAt: "2026-05-10T14:14:12.000Z",
    attemptNumber: 1,
    transcriptTurnIds: ["turn-evelyn-001", "turn-evelyn-002", "turn-evelyn-003"],
    escalationIds: ["escalation-evelyn-chest-pain"]
  },
  {
    id: "call-sam-voicemail",
    patientId: "patient-sam-wilson",
    providerCallId: "provider-call-004",
    status: "voicemail",
    disposition: "voicemail",
    startedAt: "2026-05-11T18:00:00.000Z",
    endedAt: "2026-05-11T18:01:15.000Z",
    attemptNumber: 2,
    transcriptTurnIds: [],
    escalationIds: []
  },
  {
    id: "call-lee-opted-out",
    patientId: "patient-lee-brown",
    providerCallId: "provider-call-005",
    status: "completed",
    disposition: "opted_out",
    startedAt: "2026-04-28T17:00:00.000Z",
    endedAt: "2026-04-28T17:02:00.000Z",
    attemptNumber: 1,
    transcriptTurnIds: ["turn-lee-001"],
    escalationIds: []
  }
];

export const transcriptTurns = [
  {
    id: "turn-maria-001",
    callSessionId: "call-maria-completed",
    speaker: "agent",
    text: "Hello Maria, this is CheckIn Care calling for your scheduled heart health check-in.",
    intent: "greeting",
    stateBefore: "greeting",
    stateAfter: "identity_verification",
    startedAt: "2026-05-08T20:02:04.000Z",
    endedAt: "2026-05-08T20:02:09.000Z"
  },
  {
    id: "turn-maria-002",
    callSessionId: "call-maria-completed",
    speaker: "patient",
    text: "Yes, this is Maria. I can continue.",
    confidence: 0.96,
    intent: "affirm_consent",
    stateBefore: "identity_verification",
    stateAfter: "question_sequence",
    startedAt: "2026-05-08T20:02:10.000Z",
    endedAt: "2026-05-08T20:02:14.000Z"
  },
  {
    id: "turn-maria-003",
    callSessionId: "call-maria-completed",
    speaker: "patient",
    text: "No new symptoms and I do not need a callback.",
    confidence: 0.93,
    intent: "routine_status",
    stateBefore: "question_sequence",
    stateAfter: "completion",
    startedAt: "2026-05-08T20:05:30.000Z",
    endedAt: "2026-05-08T20:05:37.000Z"
  },
  {
    id: "turn-evelyn-001",
    callSessionId: "call-evelyn-escalated",
    speaker: "agent",
    text: "Hello Evelyn, this is CheckIn Care calling for your scheduled check-in.",
    intent: "greeting",
    stateBefore: "greeting",
    stateAfter: "identity_verification",
    startedAt: "2026-05-10T14:10:02.000Z",
    endedAt: "2026-05-10T14:10:08.000Z"
  },
  {
    id: "turn-evelyn-002",
    callSessionId: "call-evelyn-escalated",
    speaker: "patient",
    text: "I am having chest pain and shortness of breath.",
    confidence: 0.91,
    intent: "urgent_symptom",
    stateBefore: "question_sequence",
    stateAfter: "escalation",
    startedAt: "2026-05-10T14:12:18.000Z",
    endedAt: "2026-05-10T14:12:24.000Z"
  },
  {
    id: "turn-evelyn-003",
    callSessionId: "call-evelyn-escalated",
    speaker: "agent",
    text: "I cannot provide medical advice. I will flag this for urgent follow-up. If this may be an emergency, please call emergency services now.",
    intent: "safe_escalation_fallback",
    stateBefore: "escalation",
    stateAfter: "completion",
    startedAt: "2026-05-10T14:12:25.000Z",
    endedAt: "2026-05-10T14:12:35.000Z"
  },
  {
    id: "turn-lee-001",
    callSessionId: "call-lee-opted-out",
    speaker: "patient",
    text: "Please stop calling me.",
    confidence: 0.78,
    intent: "opt_out",
    stateBefore: "consent",
    stateAfter: "termination",
    startedAt: "2026-04-28T17:01:00.000Z",
    endedAt: "2026-04-28T17:01:04.000Z"
  }
];

export const escalations = [
  {
    id: "escalation-evelyn-chest-pain",
    patientId: "patient-evelyn-chen",
    callSessionId: "call-evelyn-escalated",
    transcriptTurnId: "turn-evelyn-002",
    priority: "urgent",
    status: "open",
    reason: "Patient reported chest pain and shortness of breath.",
    assignedUserId: "user-clinician-001",
    createdAt: "2026-05-10T14:12:25.000Z"
  }
];

export const voiceAgentFixtures = {
  users,
  carePrograms,
  patients,
  checkInSchedules,
  callSessions,
  transcriptTurns,
  escalations
};
