import { buildIntakeSteps, getIntakePath } from '@/components/intake-flow';
import { PatientIntakeSession } from '@/components/patient-intake-session';
import { PatientShell } from '@/components/patient-shell';

type IntakeSessionPageProps = {
  params: {
    sessionId: string;
  };
};

export default function IntakeSessionPage({ params }: IntakeSessionPageProps) {
  const { sessionId } = params;

  return (
    <PatientShell
      eyebrow="In progress"
      title="Tell us about yourself and today’s visit"
      description="Complete patient demographics, visit reason, and consent details, then review everything before submitting check-in."
      steps={buildIntakeSteps('session', sessionId)}
      aside={
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Intake details</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            This step covers demographics, contact details, visit reason, and consent. Progress is
            saved as answers are entered, and the review screen will show anything still required
            before submission.
          </p>
        </div>
      }
    >
      <PatientIntakeSession
        publicSessionId={sessionId}
        reviewHref={getIntakePath('review', sessionId)}
        startHref={getIntakePath('start')}
      />
    </PatientShell>
  );
}
