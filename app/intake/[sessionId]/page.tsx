import { DemographicsSection } from '@/components/demographics-section';
import { buildIntakeSteps, getIntakePath } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';
import { VisitReasonSection } from '@/components/visit-reason-section';

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
      description="Complete the frozen MVP intake fields for patient demographics, contact basics, and the visit reason / chief complaint section. Consent and submission wiring remain intentionally out of scope in this shell."
      steps={buildIntakeSteps('session', sessionId)}
      aside={
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">MVP intake scope</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            This step implements the frozen MVP demographics/contact fields plus visit reason.
            Consent, HIPAA acknowledgements, and submission wiring remain intentionally out of scope here.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Patient flow shell preserved"
          description="The demographics and visit reason sections plug into the existing session route, shared shell, and reusable field primitives without changing downstream review or completion routes."
        />

        <DemographicsSection />

        <VisitReasonSection />

        <SessionActions
          primaryLabel="Continue to review"
          primaryHref={getIntakePath('review', sessionId)}
          secondaryLabel="Back to start"
          secondaryHref={getIntakePath('start')}
        />
      </div>
    </PatientShell>
  );
}
