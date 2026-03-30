import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StaffReviewPanel } from '@/components/staff-review-panel';
import {
  formatCompletionSummary,
  formatSessionDateTime,
  getPatientName,
  getSessionFieldDisplayValue,
  getStatusTone,
  getStaffIntakeSession,
} from '@/lib/staff-intake';

export default async function IntakeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getStaffIntakeSession(params.id);

  if (!session) {
    notFound();
  }

  const fieldEntries = Object.entries(session.fields);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Intake detail</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">{getPatientName(session)}</h1>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusTone(session.status)}`}
            >
              {session.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Session {session.publicSessionId} · read-only staff view of the patient intake record.
          </p>
        </div>
        <Link
          href="/dashboard/intake"
          className="inline-flex items-center rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100"
        >
          Back to queue
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Summary</p>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Started</dt>
              <dd>{formatSessionDateTime(session.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Submitted</dt>
              <dd>{formatSessionDateTime(session.submittedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Updated</dt>
              <dd>{formatSessionDateTime(session.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Reviewed</dt>
              <dd>{formatSessionDateTime(session.reviewedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Completion</dt>
              <dd>{formatCompletionSummary(session)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Source mode</dt>
              <dd className="capitalize">{session.sourceMode}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Required fields remaining</dt>
              <dd>{session.completionSummary.incompleteRequiredFields}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Patient snapshot</p>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">First name</dt>
              <dd>{getSessionFieldDisplayValue(session, 'patient.firstName')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Last name</dt>
              <dd>{getSessionFieldDisplayValue(session, 'patient.lastName')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date of birth</dt>
              <dd>{getSessionFieldDisplayValue(session, 'patient.dateOfBirth')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Chief complaint</dt>
              <dd>{getSessionFieldDisplayValue(session, 'visit.chiefComplaint')}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section>
        <StaffReviewPanel session={session} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Section status</p>
          <div className="mt-4 space-y-3">
            {session.sections.map((section) => (
              <div key={section.key} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{section.label}</h2>
                    <p className="mt-1 text-sm text-slate-400">State: {section.completionState}</p>
                  </div>
                  <p className="text-right text-xs uppercase tracking-[0.2em] text-slate-500">
                    {section.incompleteRequiredFields.length} required remaining
                  </p>
                </div>
                {section.incompleteRequiredFields.length > 0 ? (
                  <p className="mt-3 text-sm text-amber-200">
                    Missing: {section.incompleteRequiredFields.join(', ')}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-emerald-200">All required fields complete.</p>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Captured fields</p>
          {fieldEntries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No field values have been captured for this session yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Field</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {fieldEntries.map(([fieldKey, field]) => (
                    <tr key={fieldKey} className="bg-slate-950/20 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-cyan-100">{fieldKey}</td>
                      <td className="px-4 py-3">{getSessionFieldDisplayValue(session, fieldKey)}</td>
                      <td className="px-4 py-3">{field.completionState}</td>
                      <td className="px-4 py-3">{formatSessionDateTime(field.lastUpdatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
