import { DemographicsSection } from '@/components/demographics-section';
import { buildIntakeSteps, getIntakePath } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

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
      title="Tell us about yourself"
      description="Start with the patient demographics and contact details required for urgent care intake. This MVP step stays focused on identity and contact basics before visit reason and consent are added in later tasks."
      steps={buildIntakeSteps('session', sessionId)}
      aside={
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Demographics scope</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            This step implements the frozen MVP demographics/contact fields only. Visit reason,
            consent, and submission wiring remain intentionally out of scope here.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Patient flow shell preserved"
          description="The demographics section plugs into the existing session route, shared shell, and reusable field primitives without changing downstream review or completion routes."
        />

        <DemographicsSection />

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
