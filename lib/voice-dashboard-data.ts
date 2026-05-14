type RiskLevel = 'low' | 'medium' | 'high';
type ConsentStatus = 'granted' | 'pending' | 'revoked';
type ScheduleStatus = 'active' | 'paused';
type CallDisposition = 'completed' | 'no_answer' | 'voicemail' | 'escalated' | 'opted_out';
type EscalationPriority = 'urgent' | 'high' | 'medium' | 'low';
type EscalationStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'dismissed';

export type VoiceCallFilter = 'all' | CallDisposition;

type VoicePatient = {
  id: string;
  name: string;
  phone: string;
  timeZone: string;
  consentStatus: ConsentStatus;
  riskLevel: RiskLevel;
  careProgram: string;
  owner: string;
  nextRunAt?: string;
  scheduleStatus?: ScheduleStatus;
  lastDisposition?: CallDisposition;
  openEscalations: number;
};

type VoiceCall = {
  id: string;
  patientId: string;
  patientName: string;
  disposition: CallDisposition;
  status: string;
  startedAt: string;
  durationLabel: string;
  summary: string;
};

type VoiceEscalation = {
  id: string;
  patientName: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  reason: string;
  createdAt: string;
  owner: string;
};

const patients: VoicePatient[] = [
  {
    id: 'patient-maria-garcia',
    name: 'Maria Garcia',
    phone: '+1 (415) 555-0101',
    timeZone: 'America/Los_Angeles',
    consentStatus: 'granted',
    riskLevel: 'medium',
    careProgram: 'Heart Health Check-In',
    owner: 'Avery Patel',
    nextRunAt: '2026-05-15T20:00:00.000Z',
    scheduleStatus: 'active',
    lastDisposition: 'completed',
    openEscalations: 0,
  },
  {
    id: 'patient-evelyn-chen',
    name: 'Evelyn Chen',
    phone: '+1 (212) 555-0103',
    timeZone: 'America/New_York',
    consentStatus: 'granted',
    riskLevel: 'high',
    careProgram: 'Heart Health Check-In',
    owner: 'Jordan Lee',
    nextRunAt: '2026-05-15T13:30:00.000Z',
    scheduleStatus: 'active',
    lastDisposition: 'escalated',
    openEscalations: 1,
  },
  {
    id: 'patient-sam-wilson',
    name: 'Sam Wilson',
    phone: '+1 (312) 555-0102',
    timeZone: 'America/Chicago',
    consentStatus: 'pending',
    riskLevel: 'low',
    careProgram: 'Diabetes Wellness',
    owner: 'Avery Patel',
    lastDisposition: 'voicemail',
    openEscalations: 0,
  },
  {
    id: 'patient-lee-brown',
    name: 'Lee Brown',
    phone: '+1 (503) 555-0104',
    timeZone: 'America/Los_Angeles',
    consentStatus: 'revoked',
    riskLevel: 'low',
    careProgram: 'Diabetes Wellness',
    owner: 'Avery Patel',
    scheduleStatus: 'paused',
    lastDisposition: 'opted_out',
    openEscalations: 0,
  },
];

const calls: VoiceCall[] = [
  {
    id: 'call-evelyn-escalated',
    patientId: 'patient-evelyn-chen',
    patientName: 'Evelyn Chen',
    disposition: 'escalated',
    status: 'completed',
    startedAt: '2026-05-10T14:10:00.000Z',
    durationLabel: '4m 12s',
    summary: 'Urgent symptom reported; escalation opened for clinician review.',
  },
  {
    id: 'call-sam-voicemail',
    patientId: 'patient-sam-wilson',
    patientName: 'Sam Wilson',
    disposition: 'voicemail',
    status: 'voicemail',
    startedAt: '2026-05-11T18:00:00.000Z',
    durationLabel: '1m 15s',
    summary: 'Voicemail detected; retry eligibility pending consent confirmation.',
  },
  {
    id: 'call-sam-no-answer',
    patientId: 'patient-sam-wilson',
    patientName: 'Sam Wilson',
    disposition: 'no_answer',
    status: 'no_answer',
    startedAt: '2026-05-09T18:00:00.000Z',
    durationLabel: '1m',
    summary: 'No answer from patient; retry was scheduled.',
  },
  {
    id: 'call-maria-completed',
    patientId: 'patient-maria-garcia',
    patientName: 'Maria Garcia',
    disposition: 'completed',
    status: 'completed',
    startedAt: '2026-05-08T20:02:00.000Z',
    durationLabel: '4m 30s',
    summary: 'Routine check-in completed with no new symptoms.',
  },
  {
    id: 'call-lee-opted-out',
    patientId: 'patient-lee-brown',
    patientName: 'Lee Brown',
    disposition: 'opted_out',
    status: 'completed',
    startedAt: '2026-04-28T17:00:00.000Z',
    durationLabel: '2m',
    summary: 'Patient opted out; future schedule paused.',
  },
];

const escalations: VoiceEscalation[] = [
  {
    id: 'escalation-evelyn-chest-pain',
    patientName: 'Evelyn Chen',
    priority: 'urgent',
    status: 'open',
    reason: 'Patient reported chest pain and shortness of breath.',
    createdAt: '2026-05-10T14:12:25.000Z',
    owner: 'Jordan Lee',
  },
];

export const callFilters: { label: string; value: VoiceCallFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'No answer', value: 'no_answer' },
  { label: 'Voicemail', value: 'voicemail' },
  { label: 'Opted out', value: 'opted_out' },
];

export function getVoiceDashboardData(filter: VoiceCallFilter = 'all') {
  const filteredCalls = filter === 'all' ? calls : calls.filter((call) => call.disposition === filter);
  const activePatients = patients.filter((patient) => patient.consentStatus !== 'revoked');
  const openEscalations = escalations.filter((alert) => !['resolved', 'dismissed'].includes(alert.status));

  return {
    filter,
    metrics: [
      { label: 'Active patients', value: activePatients.length.toString(), helper: 'Eligible or pending outreach' },
      { label: 'Open alerts', value: openEscalations.length.toString(), helper: 'Needs human follow-up' },
      { label: 'Upcoming calls', value: patients.filter((patient) => patient.scheduleStatus === 'active').length.toString(), helper: 'Scheduled check-ins' },
      { label: 'Completion rate', value: '60%', helper: 'Completed or safely closed' },
    ],
    patients: [...patients].sort((left, right) => {
      if (right.openEscalations !== left.openEscalations) {
        return right.openEscalations - left.openEscalations;
      }
      const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
      return riskOrder[left.riskLevel] - riskOrder[right.riskLevel];
    }),
    calls: filteredCalls,
    escalations: openEscalations,
    activity: [
      ...openEscalations.map((alert) => ({
        id: alert.id,
        label: `${alert.patientName} alert opened`,
        detail: alert.reason,
        at: alert.createdAt,
        tone: 'alert' as const,
      })),
      ...calls.slice(0, 4).map((call) => ({
        id: call.id,
        label: `${call.patientName} call ${formatDisposition(call.disposition).toLowerCase()}`,
        detail: call.summary,
        at: call.startedAt,
        tone: call.disposition === 'escalated' ? ('alert' as const) : ('neutral' as const),
      })),
    ].sort((left, right) => right.at.localeCompare(left.at)),
  };
}

export function formatDashboardTime(value?: string) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDisposition(value?: string) {
  const labels: Record<string, string> = {
    completed: 'Completed',
    no_answer: 'No answer',
    voicemail: 'Voicemail',
    escalated: 'Escalated',
    opted_out: 'Opted out',
  };

  return value ? labels[value] || value : 'No calls';
}

export function getRiskTone(riskLevel: RiskLevel) {
  const tones: Record<RiskLevel, string> = {
    high: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    medium: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  };

  return tones[riskLevel];
}

export function getDispositionTone(disposition?: string) {
  const tones: Record<string, string> = {
    completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    no_answer: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    voicemail: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
    escalated: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    opted_out: 'border-slate-600 bg-slate-800 text-slate-300',
  };

  return tones[disposition || ''] || 'border-slate-700 bg-slate-900 text-slate-300';
}
