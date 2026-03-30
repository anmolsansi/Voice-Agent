import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { IntakeReviewScreen } from '@/components/intake-review-screen';
import { PatientShell } from '@/components/patient-shell';

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
      description="Review the current intake answers, see which required items still need attention, and return to the right section before submission is enabled."
      steps={buildIntakeSteps('review', sessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Current session</h2>
          <p>
            Reviewing session: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>Use this screen to confirm what is complete and jump back to any section that still needs attention.</p>
        </div>
      }
    >
      <IntakeReviewScreen
        publicSessionId={sessionId}
        sessionHref={getIntakePath('session', sessionId)}
        completeHref={getIntakePath('complete', sessionId)}
        startHref={getIntakePath('start')}
      />
    </PatientShell>
  );
}
