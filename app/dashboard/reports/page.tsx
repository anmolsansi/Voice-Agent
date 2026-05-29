import Link from 'next/link';
import {
  buildVoiceReport,
  formatReportLabel,
  listReportFilterOptions,
  normalizeReportFilters,
  reportRanges,
  type VoiceReportFilters,
} from '@/src/services/reports/reporting-service.mjs';

type ReportSearchParams = {
  range?: string;
  program?: string;
  owner?: string;
  status?: string;
};

const metricLabels = [
  { key: 'scheduledCalls', label: 'Scheduled calls', helper: 'Active schedules in scope' },
  { key: 'attemptedCalls', label: 'Attempted calls', helper: 'Calls in selected range' },
  { key: 'completedCheckIns', label: 'Completed check-ins', helper: 'Finished without escalation' },
  { key: 'failedCalls', label: 'Failed calls', helper: 'No-answer, voicemail, or failed' },
  { key: 'retryRate', label: 'Retry rate', helper: 'Attempts after first try' },
  { key: 'escalationRate', label: 'Escalation rate', helper: 'Escalations per attempt' },
  { key: 'urgentAlertCount', label: 'Urgent alerts', helper: 'Highest-priority flags' },
  { key: 'transcriptConfidence', label: 'Avg. confidence', helper: 'Patient transcript turns' },
] as const;

function buildHref(overrides: Partial<VoiceReportFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(overrides)) {
    if (value && value !== 'all') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `/dashboard/reports?${query}` : '/dashboard/reports';
}

function buildFilterHref(
  filters: ReturnType<typeof normalizeReportFilters>,
  key: keyof Pick<VoiceReportFilters, 'range' | 'program' | 'owner' | 'status'>,
  value: string,
) {
  return buildHref({
    range: filters.range,
    program: filters.program,
    owner: filters.owner,
    status: filters.status,
    [key]: value,
  });
}

function formatDuration(seconds: number) {
  if (!seconds) return '0m';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function filterButtonClass(active: boolean) {
  return `rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
    active
      ? 'border-cyan-300 bg-cyan-300 text-slate-950'
      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/60'
  }`;
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams?: ReportSearchParams;
}) {
  const filters = normalizeReportFilters(searchParams);
  const report = buildVoiceReport(filters);
  const filterOptions = listReportFilterOptions();
  const exportHref = `/api/reports/export?${new URLSearchParams({
    range: filters.range,
    program: filters.program,
    owner: filters.owner,
    status: filters.status,
    requestedBy: 'staff-dashboard',
  }).toString()}`;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Voice performance reports
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Track check-in coverage, quality, retry load, escalations, and export audit-ready operational snapshots.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex w-full items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 sm:w-auto"
        >
          Export CSV
        </a>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Filters
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Snapshot generated {new Date(report.metadata.generatedAt).toLocaleString('en-US')} with {report.metadata.rowCount} export rows.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Range</p>
            <div className="flex flex-wrap gap-2">
              {reportRanges.map((range) => (
                <Link
                  key={range.value}
                  href={buildFilterHref(filters, 'range', range.value)}
                  className={filterButtonClass(filters.range === range.value)}
                >
                  {range.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Program</p>
            <div className="flex flex-wrap gap-2">
              <Link href={buildFilterHref(filters, 'program', 'all')} className={filterButtonClass(filters.program === 'all')}>
                All
              </Link>
              {filterOptions.programs.map((program) => (
                <Link
                  key={program.value}
                  href={buildFilterHref(filters, 'program', program.value)}
                  className={filterButtonClass(filters.program === program.value)}
                >
                  {program.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Owner</p>
            <div className="flex flex-wrap gap-2">
              <Link href={buildFilterHref(filters, 'owner', 'all')} className={filterButtonClass(filters.owner === 'all')}>
                All
              </Link>
              {filterOptions.owners.map((owner) => (
                <Link
                  key={owner.value}
                  href={buildFilterHref(filters, 'owner', owner.value)}
                  className={filterButtonClass(filters.owner === owner.value)}
                >
                  {owner.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
            <div className="flex flex-wrap gap-2">
              {filterOptions.statuses.map((status) => (
                <Link
                  key={status.value}
                  href={buildFilterHref(filters, 'status', status.value)}
                  className={filterButtonClass(filters.status === status.value)}
                >
                  {status.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricLabels.map((metric) => (
          <article
            key={metric.key}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <span className="text-sm text-slate-400">{metric.label}</span>
            <strong className="mt-3 block text-3xl text-white">
              {String(report.metrics[metric.key])}
            </strong>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              {metric.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Trend
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Daily call outcomes</h2>
            </div>
            <p className="text-sm text-slate-400">
              Avg. duration {formatDuration(report.metrics.averageDurationSeconds)}
            </p>
          </div>
          {report.trends.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              No call outcomes matched the current filters.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Attempts</th>
                    <th className="py-3 pr-4">Completed</th>
                    <th className="py-3 pr-4">Failed</th>
                    <th className="py-3">Escalated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report.trends.map((trend) => (
                    <tr key={trend.date}>
                      <td className="py-3 pr-4 font-medium text-white">{trend.date}</td>
                      <td className="py-3 pr-4">{trend.attempted}</td>
                      <td className="py-3 pr-4">{trend.completed}</td>
                      <td className="py-3 pr-4">{trend.failed}</td>
                      <td className="py-3">{trend.escalated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Snapshot
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Export preview</h2>
            </div>
            <p className="text-sm text-slate-400">
              Schema {report.metadata.schemaVersion}
            </p>
          </div>

          {report.empty ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              Empty export: no records matched the current filters.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Patient</th>
                    <th className="py-3 pr-4">Program</th>
                    <th className="py-3 pr-4">Owner</th>
                    <th className="py-3 pr-4">Outcome</th>
                    <th className="py-3 pr-4">Confidence</th>
                    <th className="py-3">Escalations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report.rows.map((row) => (
                    <tr key={row.callId}>
                      <td className="py-3 pr-4">
                        <span className="block font-medium text-white">{row.patientName}</span>
                        <span className="text-xs text-slate-500">{row.phone}</span>
                      </td>
                      <td className="py-3 pr-4">{row.program}</td>
                      <td className="py-3 pr-4">{row.owner}</td>
                      <td className="py-3 pr-4">{formatReportLabel(row.disposition)}</td>
                      <td className="py-3 pr-4">{row.averageConfidence || 'n/a'}</td>
                      <td className="py-3">{row.escalationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
