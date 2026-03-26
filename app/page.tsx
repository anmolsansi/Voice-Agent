import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          CheckIn Care
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
          Voice-first urgent care intake foundation
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          This branch includes patient intake flow foundation, staff dashboard shell, backend scaffolding, migrations, voice abstractions, and core planning/control docs.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/intake/start"
            className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Open patient intake
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100"
          >
            Open staff dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
