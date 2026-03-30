import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { IntakeStartCard } from '@/components/intake-start-card';
import { PatientShell } from '@/components/patient-shell';
import { StateCard } from '@/components/state-card';

const demoSessionId = getSafeSessionId();

export default function IntakeStartPage() {
  return (
    <PatientShell
      eyebrow="Welcome"
      title="Let’s get you checked in"
      description="Start a new patient check-in, return to an in-progress intake on this device, and review answers before submitting."
      steps={buildIntakeSteps('start', demoSessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">What to expect</h2>
          <p>Begin a new intake, answer the required questions, review what was captured, and finish with a confirmation page.</p>
          <p>You can also resume a saved session on this device if the patient needs more time.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Ready to begin"
          description="Use this as the stable patient entry point for new sessions, kiosk resets, QR launches, or staff-guided starts."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <IntakeStartCard reviewHref={getIntakePath('review', demoSessionId)} />

          <StateCard
            title="Review before you submit"
            description="Patients can confirm their answers and see any missing required items before check-in is submitted."
          />
        </div>
      </div>
    </PatientShell>
  );
}
