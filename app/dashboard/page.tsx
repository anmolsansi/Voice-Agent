import Link from 'next/link';
import { EmptyState } from '@/components/staff-states';
import { dashboardStats } from '@/lib/staff-shell-data';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Clinic intake operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Shell-only view for queue monitoring, escalation triage, and follow-up workflows.
          </p>
        </div>
        <Link
          href="/dashboard/intake/demo-session"
          className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Open sample intake
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <span className="text-sm text-slate-400">{stat.label}</span>
            <strong className="mt-3 block text-3xl text-white">{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <EmptyState
          eyebrow="Queue"
          title="No live queue integration yet"
          description="Hook this card to intake session summaries, SLAs, and assignment state in a future task."
        />
        <EmptyState
          eyebrow="Escalations"
          title="No escalations in placeholder mode"
          description="Use this area for urgent flags, incomplete required fields, or staffing notifications."
        />
      </section>
    </div>
  );
}
