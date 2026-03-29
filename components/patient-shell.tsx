import Link from 'next/link';
import { ReactNode } from 'react';

type ShellStep = {
  label: string;
  href?: string;
  status?: 'complete' | 'current' | 'upcoming';
};

type PatientShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  steps?: ShellStep[];
  aside?: ReactNode;
};

function stepClasses(status: ShellStep['status']) {
  switch (status) {
    case 'complete':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'current':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-slate-200 bg-white text-slate-500';
  }
}

function StepContent({ step, index }: { step: ShellStep; index: number }) {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-[0.2em]">Step {index + 1}</div>
      <div className="mt-1 text-sm font-medium">{step.label}</div>
    </>
  );
}

export function PatientShell({
  eyebrow,
  title,
  description,
  children,
  steps,
  aside,
}: PatientShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-blue-700">CheckIn Care</p>
          <p className="text-xs text-slate-500">Patient intake</p>
        </div>
        <Link
          href="/intake/start"
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Start over
        </Link>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-white/80 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">{eyebrow}</p>
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
            </div>
          </div>

          {steps && steps.length > 0 ? (
            <ol className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => {
                const className = `rounded-2xl border px-4 py-3 ${stepClasses(step.status)}`;

                return (
                  <li key={`${step.label}-${index}`}>
                    {step.href ? (
                      <Link href={step.href} className={`block transition hover:shadow-sm ${className}`}>
                        <StepContent step={step} index={index} />
                      </Link>
                    ) : (
                      <div className={className}>
                        <StepContent step={step} index={index} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {children}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-slate-50 shadow-soft">
            <p className="text-sm font-semibold text-blue-200">Your visit</p>
            <h2 className="mt-2 text-xl font-semibold">A calm, mobile-friendly intake flow</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This shell is ready for voice-first and manual-first experiences. Form sections,
              validation, and structured question logic will plug in next.
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            {aside ?? (
              <>
                <h2 className="text-base font-semibold text-slate-900">Need help?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ask staff for support if you would rather complete intake together or switch
                  between voice and manual entry.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
