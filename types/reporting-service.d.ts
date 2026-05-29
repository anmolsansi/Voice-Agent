declare module '@/src/services/reports/reporting-service.mjs' {
  export type VoiceReportRange = '7d' | '30d' | 'all';

  export type VoiceReportFilters = {
    range?: VoiceReportRange | string;
    program?: string;
    owner?: string;
    status?: string;
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
  };

  export type VoiceReportRow = {
    callId: string;
    patientId: string;
    patientName: string;
    phone: string;
    program: string;
    owner: string;
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
  };
  export function normalizeReportFilters(
    filters?: VoiceReportFilters,
  ): Required<Pick<VoiceReportFilters, 'range' | 'program' | 'owner' | 'status' | 'requestedBy'>>;
  export function buildVoiceReport(filters?: VoiceReportFilters): VoiceReport;
  export function exportVoiceReportCsv(report: VoiceReport): string;
  export function formatReportLabel(value?: string): string;
}
