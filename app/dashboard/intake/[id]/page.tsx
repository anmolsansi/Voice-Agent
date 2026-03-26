import Link from 'next/link';
import { EmptyState } from '@/components/staff-states';

export default function IntakeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Intake detail
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Demo patient</h1>
          <p className="mt-2 text-sm text-slate-400">
            Session {params.id} · shell view for staff review, completion checks, and follow-up routing.
          </p>
        </div>
        <Link
          href="/dashboard/intake"
          className="inline-flex items-center rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100"
        >
          Back to queue
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Summary
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Waiting review</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <dt className="text-slate-500">Assigned to</dt>
              <dd>Unassigned</dd>
            </div>
            <div>
              <dt className="text-slate-500">Completion</dt>
              <dd>72%</dd>
            </div>
            <div>
              <dt className="text-slate-500">Arrival window</dt>
              <dd>Today · 2:15 PM</dd>
            </div>
            <div>
              <dt className="text-slate-500">Contact preference</dt>
              <dd>SMS updates</dd>
            </div>
          </dl>
        </article>

        <EmptyState
          eyebrow="Loading state"
          title="Detail loading shell ready"
          description="Use this card as the future skeleton/loading fallback while intake records hydrate from the backend."
        />
      </section>
    </div>
  );
}
