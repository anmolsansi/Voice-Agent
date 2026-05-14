import Link from 'next/link';
import {
  callFilters,
  formatDashboardTime,
  formatDisposition,
  getDispositionTone,
  getRiskTone,
  getVoiceDashboardData,
  type VoiceCallFilter,
} from '@/lib/voice-dashboard-data';

const validFilters = new Set(callFilters.map((filter) => filter.value));

export default function VoiceDashboardPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const requestedFilter = searchParams?.status || 'all';
  const filter = validFilters.has(requestedFilter as VoiceCallFilter)
    ? (requestedFilter as VoiceCallFilter)
    : 'all';
  const dashboard = getVoiceDashboardData(filter);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Voice Operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Care-team voice dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Monitor scheduled check-ins, call outcomes, patient risk, and urgent follow-up from one operations view.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Next action
          </p>
          <p className="mt-1">Review 1 urgent escalation</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <span className="text-sm text-slate-400">{metric.label}</span>
            <strong className="mt-3 block text-3xl text-white">{metric.value}</strong>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              {metric.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Patient queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Check-ins needing attention</h2>
            </div>
            <p className="text-sm text-slate-400">{dashboard.patients.length} patients tracked</p>
          </div>

          <div className="mt-5 divide-y divide-slate-800">
            {dashboard.patients.map((patient) => (
              <article key={patient.id} className="grid gap-4 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{patient.name}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getRiskTone(patient.riskLevel)}`}>
                      {patient.riskLevel}
                    </span>
                    {patient.openEscalations > 0 ? (
                      <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">
                        {patient.openEscalations} alert
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{patient.careProgram}</p>
                  <dl className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</dt>
                      <dd className="mt-1">{patient.owner}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Next check-in</dt>
                      <dd className="mt-1">{formatDashboardTime(patient.nextRunAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getDispositionTone(patient.lastDisposition)}`}>
                    {formatDisposition(patient.lastDisposition)}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
                    {patient.consentStatus}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Alerts
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Open follow-up</h2>
            <div className="mt-4 space-y-3">
              {dashboard.escalations.map((alert) => (
                <article key={alert.id} className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-white">{alert.patientName}</h3>
                    <span className="rounded-full bg-rose-400 px-2.5 py-1 text-xs font-semibold text-slate-950">
                      {alert.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-rose-100">{alert.reason}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-rose-200">
                    Owner {alert.owner} - {formatDashboardTime(alert.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Recent activity
            </p>
            <div className="mt-4 space-y-3">
              {dashboard.activity.slice(0, 5).map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {formatDashboardTime(item.at)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Call status
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Outcome feed</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {callFilters.map((callFilter) => {
              const active = callFilter.value === filter;

              return (
                <Link
                  key={callFilter.value}
                  href={callFilter.value === 'all' ? '/dashboard/voice' : `/dashboard/voice?status=${callFilter.value}`}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    active
                      ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/60'
                  }`}
                >
                  {callFilter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {dashboard.calls.map((call) => (
            <article
              key={call.id}
              className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{call.patientName}</h3>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getDispositionTone(call.disposition)}`}>
                    {formatDisposition(call.disposition)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{call.summary}</p>
              </div>
              <div className="text-sm text-slate-300 lg:text-right">
                <p>{formatDashboardTime(call.startedAt)}</p>
                <p className="mt-1 text-slate-500">{call.durationLabel}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
