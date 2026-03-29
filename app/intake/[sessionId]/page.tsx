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
      description="Complete the frozen MVP intake fields for patient demographics, visit reason, and consent / HIPAA acknowledgment using the existing manual intake shell. Submission wiring remains intentionally lightweight in this branch."
      steps={buildIntakeSteps('session', sessionId)}
      aside={
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">MVP intake scope</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            This step implements the frozen MVP demographics/contact, visit reason, and consent
            sections. Required acknowledgments are visible here, while submission and backend save
            wiring remain intentionally lightweight.
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
