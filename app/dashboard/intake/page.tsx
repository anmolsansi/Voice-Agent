import Link from 'next/link';
import { EmptyState } from '@/components/staff-states';
import { intakeQueueItems } from '@/lib/staff-shell-data';

export default function IntakeQueuePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Queue
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Intake queue</h1>
        <p className="mt-2 text-sm text-slate-400">
          Shell page for staff review, assignment, and escalation workflows.
        </p>
      </section>

      <section className="grid gap-4">
        {intakeQueueItems.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/intake/${item.id}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.patientName}</h2>
                <p className="mt-1 text-sm text-slate-400">{item.concern}</p>
              </div>
              <div className="text-sm text-slate-300">{item.submittedAt}</div>
            </div>
            <div className="mt-4 flex gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>{item.status}</span>
              <span>•</span>
              <span>{item.priority}</span>
            </div>
          </Link>
        ))}
      </section>

      <EmptyState
        eyebrow="Loading state"
        title="Queue shell ready"
        description="Reserve this area for skeleton/loading treatment once backend summaries hydrate the queue."
      />
    </div>
  );
}
