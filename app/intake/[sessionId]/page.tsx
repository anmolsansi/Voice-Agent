import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const steps = [
  { label: 'Start', status: 'complete' as const },
  { label: 'Intake session', status: 'current' as const },
  { label: 'Review answers', status: 'upcoming' as const },
  { label: 'Complete', status: 'upcoming' as const },
];

type IntakeSessionPageProps = {
  params: {
    sessionId: string;
  };
};

export default function IntakeSessionPage({ params }: IntakeSessionPageProps) {
  return (
    <PatientShell
      eyebrow="In progress"
      title="Your intake session is ready"
      description="This route is reserved for session-aware intake content. Voice transcript UI, section scaffolds, and manual entry components can mount here without changing the patient shell."
      steps={steps}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Session placeholder</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{params.sessionId}</span>
          </p>
          <p>
            This page intentionally avoids schema-specific fields while providing a clean container
            for future intake modules.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Loading-friendly intake workspace"
          description="Use this surface for question cards, transcript panels, autosave indicators, and validation banners."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900">Planned content regions</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Active voice/manual question area</li>
              <li>• Supporting instructions or help text</li>
              <li>• Sticky progress and save state treatment</li>
            </ul>
          </div>
          <StateCard
            title="No intake sections yet"
            description="Field schemas and dynamic section rendering are intentionally deferred."
          />
        </div>

        <SessionActions
          primaryLabel="Continue to review"
          primaryHref="/intake/review"
          secondaryLabel="Back to start"
          secondaryHref="/intake/start"
        />
      </div>
    </PatientShell>
  );
}
