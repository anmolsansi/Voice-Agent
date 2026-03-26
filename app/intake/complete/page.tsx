import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const steps = [
  { label: 'Start', status: 'complete' as const },
  { label: 'Intake session', status: 'complete' as const },
  { label: 'Review answers', status: 'complete' as const },
  { label: 'Complete', status: 'current' as const },
];

export default function IntakeCompletePage() {
  return (
    <PatientShell
      eyebrow="Complete"
      title="You’re ready for the next step"
      description="This page acts as the completion-state shell once intake is submitted or handed off to staff for confirmation."
      steps={steps}
    >
      <div className="space-y-6">
        <StateCard
          title="Thanks for checking in"
          description="A later iteration can add confirmation details, next-step guidance, and status updates from the clinic."
          tone="success"
        />

        <div className="rounded-3xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Completion state behavior</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Shared-device reset timing, final confirmation messaging, and any staff handoff details
            can plug into this route without changing the overall patient shell.
          </p>
          <SessionActions
            primaryLabel="Return to start"
            primaryHref="/intake/start"
            secondaryLabel="Review scaffold"
            secondaryHref="/intake/review"
          />
        </div>
      </div>
    </PatientShell>
  );
}
