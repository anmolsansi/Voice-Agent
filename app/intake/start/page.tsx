import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const steps = [
  { label: 'Start', status: 'current' as const },
  { label: 'Intake session', status: 'upcoming' as const },
  { label: 'Review answers', status: 'upcoming' as const },
  { label: 'Complete', status: 'upcoming' as const },
];

export default function IntakeStartPage() {
  return (
    <PatientShell
      eyebrow="Welcome"
      title="Let’s get you checked in"
      description="This patient intake shell is designed for phone, tablet, and kiosk use. Voice and manual sections will plug into this experience without changing the surrounding flow."
      steps={steps}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">What to expect</h2>
          <p>Answer a few guided questions, review your information, and confirm when ready.</p>
          <p>This page intentionally stays generic until intake schemas are wired in.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Ready to begin"
          description="Start a new intake session or continue with a placeholder route for a specific session."
        />

        <div className="rounded-3xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Patient entry point</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            In the next phase, this area will initialize a session, confirm language or accessibility
            preferences, and hand off to either voice-first or manual-first intake.
          </p>
          <SessionActions
            primaryLabel="Start intake"
            primaryHref="/intake/demo-session"
            secondaryLabel="Jump to review"
            secondaryHref="/intake/review"
          />
        </div>
      </div>
    </PatientShell>
  );
}
