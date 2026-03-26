import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const demoSessionId = getSafeSessionId();

export default function IntakeStartPage() {
  return (
    <PatientShell
      eyebrow="Welcome"
      title="Let’s get you checked in"
      description="This entry route anchors the intake flow and hands patients into a session-aware workspace, review shell, and completion state without locking in schema details yet."
      steps={buildIntakeSteps('start', demoSessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">What to expect</h2>
          <p>Begin a new intake, move through the session shell, review what was captured, and finish with a confirmation state.</p>
          <p>This route stays intentionally generic until voice and manual intake modules are plugged in.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Ready to begin"
          description="Use this as the stable patient entry point for new sessions, kiosk resets, QR launches, or staff-guided starts."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Intake flow entry</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              A later implementation can create a real session here, confirm accessibility or language preferences,
              and decide whether the patient enters a voice-first or manual-first experience.
            </p>
            <SessionActions
              primaryLabel="Start intake"
              primaryHref={getIntakePath('session', demoSessionId)}
              secondaryLabel="Preview review route"
              secondaryHref={getIntakePath('review', demoSessionId)}
            />
          </div>

          <StateCard
            title="Shell-level only"
            description="No schema-specific sections are rendered yet; this task keeps the flow scaffolding ready for later work."
          />
        </div>
      </div>
    </PatientShell>
  );
}
