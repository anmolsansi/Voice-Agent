import { buildIntakeSteps, getIntakePath, getSafeSessionId } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

type IntakeCompletePageProps = {
  searchParams?: {
    sessionId?: string;
    submissionId?: string;
    submittedAt?: string;
  };
};

function formatSubmittedAt(value?: string) {
  if (!value) return 'Just now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function IntakeCompletePage({ searchParams }: IntakeCompletePageProps) {
  const sessionId = getSafeSessionId(searchParams?.sessionId);
  const submissionId = searchParams?.submissionId?.trim() || sessionId;
  const submittedAt = formatSubmittedAt(searchParams?.submittedAt);

  return (
    <PatientShell
      eyebrow="Complete"
      title="Check-in complete"
      description="Your intake has been submitted successfully. Please keep your confirmation number handy in case staff asks for it."
      steps={buildIntakeSteps('complete', sessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Confirmation</h2>
          <p>
            Session reference: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            Confirmation number: <span className="font-mono text-slate-900">{submissionId}</span>
          </p>
          <p>Submitted {submittedAt}</p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Thanks — you’re checked in"
          description="Your information was sent to the care team. You can take a seat, and staff will call you when they are ready."
          tone="success"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Confirmation number</p>
              <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{submissionId}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Submitted</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{submittedAt}</p>
            </div>
          </div>
        </StateCard>

        <div className="rounded-3xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">What happens next?</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Staff can now review your intake before your visit.</li>
            <li>• If anything else is needed, someone from the clinic will let you know.</li>
            <li>• On a shared device, you can safely return to the start screen after reviewing this confirmation.</li>
          </ul>
          <SessionActions
            primaryLabel="Return to start"
            primaryHref={getIntakePath('start')}
            secondaryLabel="Back to review"
            secondaryHref={getIntakePath('review', sessionId)}
          />
        </div>
      </div>
    </PatientShell>
  );
}
