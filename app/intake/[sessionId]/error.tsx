'use client';

import { useEffect } from 'react';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const steps = [
  { label: 'Start', status: 'complete' as const },
  { label: 'Intake session', status: 'current' as const },
  { label: 'Review answers', status: 'upcoming' as const },
  { label: 'Complete', status: 'upcoming' as const },
];

type IntakeSessionErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function IntakeSessionError({ error, reset }: IntakeSessionErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PatientShell
      eyebrow="Something went wrong"
      title="We couldn’t open this intake session"
      description="Please try again. If the issue continues, a staff member can help you restart your check-in."
      steps={steps}
    >
      <div className="space-y-6">
        <StateCard
          title="Session unavailable"
          description="This error view is intentionally generic and safe for shared devices."
          tone="warning"
        >
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
        </StateCard>

        <SessionActions
          primaryLabel="Return to start"
          primaryHref="/intake/start"
          secondaryLabel="Open review shell"
          secondaryHref="/intake/review"
        />
      </div>
    </PatientShell>
  );
}
