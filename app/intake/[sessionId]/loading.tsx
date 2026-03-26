import { PatientShell } from '@/components/patient-shell';

const steps = [
  { label: 'Start', status: 'complete' as const },
  { label: 'Intake session', status: 'current' as const },
  { label: 'Review answers', status: 'upcoming' as const },
  { label: 'Complete', status: 'upcoming' as const },
];

export default function IntakeSessionLoading() {
  return (
    <PatientShell
      eyebrow="Loading"
      title="Preparing your intake session"
      description="Please wait a moment while we load the next step for your visit."
      steps={steps}
    >
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-3xl bg-slate-100" />
          <div className="h-44 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </div>
    </PatientShell>
  );
}
