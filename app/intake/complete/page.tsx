import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

type IntakeCompletePageProps = {
  searchParams?: {
    sessionId?: string;
  };
};

export default function IntakeCompletePage({ searchParams }: IntakeCompletePageProps) {
  const sessionId = getSafeSessionId(searchParams?.sessionId);

  return (
    <PatientShell
      eyebrow="Complete"
      title="You’re ready for the next step"
      description="This page acts as the completion-state shell after intake submission or staff handoff, while keeping session context available for future confirmations."
      steps={buildIntakeSteps('complete', sessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Completed session</h2>
          <p>
            Session reference: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>Confirmation details, wait-time updates, and shared-device reset behavior can plug in here later.</p>
        </div>
      }
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
            primaryHref={getIntakePath('start')}
            secondaryLabel="Back to review"
            secondaryHref={getIntakePath('review', sessionId)}
          />
        </div>
      </div>
    </PatientShell>
  );
}
