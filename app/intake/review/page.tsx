import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

const steps = [
  { label: 'Start', status: 'complete' as const },
  { label: 'Intake session', status: 'complete' as const },
  { label: 'Review answers', status: 'current' as const },
  { label: 'Complete', status: 'upcoming' as const },
];

export default function IntakeReviewPage() {
  return (
    <PatientShell
      eyebrow="Review"
      title="Check your information before submitting"
      description="This route provides the shell for a final review state. Structured answers, validation details, and edit affordances will be connected in a later feature."
      steps={steps}
    >
      <div className="space-y-6">
        <StateCard
          title="Review scaffold"
          description="A future implementation will summarize captured answers here and clearly show what still needs attention."
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
            description="No patient-specific values are rendered yet by design."
            tone="warning"
          />
        </div>

        <SessionActions
          primaryLabel="Continue to completion"
          primaryHref="/intake/complete"
          secondaryLabel="Back to intake shell"
          secondaryHref="/intake/demo-session"
        />
      </div>
    </PatientShell>
  );
}
