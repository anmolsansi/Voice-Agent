import Link from 'next/link';

const nav = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Clinic overview and queue health.',
  },
  {
    label: 'Intake queue',
    href: '/dashboard/intake',
    description: 'Review submitted patient intake shells.',
  },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:grid md:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-900/80 p-6 md:border-b-0 md:border-r">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          CheckIn Care
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Staff dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Operations shell for clinic intake workflows.
        </p>

        <nav className="mt-8 space-y-3" aria-label="Clinic operations">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:border-cyan-500/50 hover:bg-slate-800/80"
            >
              <div className="font-medium">{item.label}</div>
              <div className="mt-1 text-sm text-slate-400">{item.description}</div>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Clinic Ops
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              CheckIn Care - Intake Operations
            </h2>
          </div>
          <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            Staff placeholder
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
