import Link from 'next/link';
import { EmptyState } from '@/components/staff-states';
import {
  formatCompletionSummary,
  formatSessionDateTime,
  getPatientName,
  getStatusTone,
  listStaffIntakeSessions,
} from '@/lib/staff-intake';

export default async function IntakeQueuePage() {
  const sessions = await listStaffIntakeSessions();
  const sortedSessions = [...sessions].sort((left, right) => {
    const leftTime = new Date(left.submittedAt || left.startedAt).getTime();
    const rightTime = new Date(right.submittedAt || right.startedAt).getTime();
    return rightTime - leftTime;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Queue</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Intake queue</h1>
        <p className="mt-2 text-sm text-slate-400">
          Live intake sessions from the backend. Review submitted sessions or monitor active intakes in progress.
        </p>
      </section>

      {sortedSessions.length === 0 ? (
        <EmptyState
          eyebrow="No sessions"
          title="No intake sessions yet"
          description="New intake sessions will appear here as patients begin or submit their check-in."
        />
      ) : (
        <section className="grid gap-4">
          {sortedSessions.map((session) => (
            <Link
              key={session.publicSessionId}
              href={`/dashboard/intake/${session.publicSessionId}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-cyan-500/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">{getPatientName(session)}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusTone(session.status)}`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Session {session.publicSessionId}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <p>Started {formatSessionDateTime(session.startedAt)}</p>
                  {session.submittedAt ? <p>Submitted {formatSessionDateTime(session.submittedAt)}</p> : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Completion</p>
                  <p className="mt-1">{formatCompletionSummary(session)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Last updated</p>
                  <p className="mt-1">{formatSessionDateTime(session.updatedAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
