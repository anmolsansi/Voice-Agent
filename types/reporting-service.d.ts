declare module '@/src/services/reports/reporting-service.mjs' {
  export type VoiceReportRange = '7d' | '30d' | 'all';

  export type VoiceReportFilters = {
    range?: VoiceReportRange | string;
    program?: string;
    owner?: string;
    status?: string;
    risk?: string;
    timeZone?: string;
    requestedBy?: string;
    now?: string;
    generatedAt?: string;
  };

  export type VoiceReportMetricSet = {
    scheduledCalls: number;
    attemptedCalls: number;
    reachedPatients: number;
    completedCheckIns: number;
    failedCalls: number;
    retryRate: string;
    escalationRate: string;
    urgentAlertCount: number;
    averageDurationSeconds: number;
    fallbackCount: number;
    transcriptConfidence: number;
    activeEscalations: number;
    completionRate: string;
    contactRate: string;
    noAnswerRate: string;
    guardrailRate: string;
  };

  export type VoiceReportRow = {
    callId: string;
    patientId: string;
    patientName: string;
    phone: string;
    program: string;
    owner: string;
    riskLevel: string;
    disposition: string;
    status: string;
    startedAt: string;
    durationSeconds: number;
    attemptNumber: number;
    escalationCount: number;
    urgentEscalationCount: number;
    averageConfidence: number;
    summary: string;
  };

  export type VoiceReport = {
    metadata: {
      requestedBy: string;
      generatedAt: string;
      filters: Record<string, unknown>;
      rowCount: number;
      schemaVersion: string;
      redactions: string[];
    };
    metrics: VoiceReportMetricSet;
    metricDefinitions: Record<string, {
      label: string;
      formula: string;
      numerator: string;
      denominator: string;
    }>;
    aggregationContract: {
      request: Record<string, string>;
      response: Record<string, string>;
    };
    eventSummary: Record<string, number>;
    breakdowns: {
      byProgram: Array<{ label: string; attempted: number; completed: number; escalated: number; failed: number }>;
      byOutcome: Array<{ label: string; count: number; rate: string }>;
      byRiskLevel: Array<{ label: string; attempted: number; completed: number; escalated: number; failed: number }>;
    };
    escalationSummary: {
      total: number;
      open: number;
      urgent: number;
      byOwner: Array<{ owner: string; total: number; urgent: number; open: number }>;
    };
    trends: Array<{
      date: string;
      attempted: number;
      completed: number;
      failed: number;
      escalated: number;
    }>;
    rows: VoiceReportRow[];
    empty: boolean;
  };

  export const reportRanges: Array<{ label: string; value: VoiceReportRange }>;
  export function listReportFilterOptions(): {
    programs: Array<{ label: string; value: string }>;
    owners: Array<{ label: string; value: string }>;
    statuses: Array<{ label: string; value: string }>;
    risks: Array<{ label: string; value: string }>;
  };
  export function normalizeReportFilters(
    filters?: VoiceReportFilters,
  ): Required<Pick<VoiceReportFilters, 'range' | 'program' | 'owner' | 'status' | 'risk' | 'timeZone' | 'requestedBy'>>;
  export function buildVoiceReport(filters?: VoiceReportFilters): VoiceReport;
  export function exportVoiceReportCsv(report: VoiceReport): string;
  export function formatReportLabel(value?: string): string;
}
