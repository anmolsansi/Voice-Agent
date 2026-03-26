import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

type IntakeReviewPageProps = {
  searchParams?: {
    sessionId?: string;
  };
};

export default function IntakeReviewPage({ searchParams }: IntakeReviewPageProps) {
  const sessionId = getSafeSessionId(searchParams?.sessionId);

  return (
    <PatientShell
      eyebrow="Review"
      title="Check your information before submitting"
      description="This route provides a session-aware review shell so later answer summaries and edit affordances can plug in without changing the flow structure."
      steps={buildIntakeSteps('review', sessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Current session</h2>
          <p>
            Reviewing session: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>This screen stays generic until structured summaries and validation details are added.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Review scaffold"
          description="A future implementation will summarize captured answers here, highlight anything incomplete, and offer clear ways to edit responses."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900">Included later</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Section-by-section answer summaries</li>
              <li>• Inline edits and voice/manual switching</li>
              <li>• Submission gating for missing required details</li>
            </ul>
          </div>
          <StateCard
            title="Waiting on intake data"
            description="No patient-specific values are rendered yet by design, but the session path is preserved through this route."
            tone="warning"
          />
        </div>

        <SessionActions
          primaryLabel="Continue to completion"
          primaryHref={getIntakePath('complete', sessionId)}
          secondaryLabel="Back to intake shell"
          secondaryHref={getIntakePath('session', sessionId)}
        />
      </div>
    </PatientShell>
  );
}
