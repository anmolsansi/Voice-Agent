'use client';

import { useState } from 'react';
import { type IntakeSession } from '@/lib/intake-session';
import { formatSessionDateTime } from '@/lib/staff-intake';

type StaffReviewPanelProps = {
  session: IntakeSession;
};

type ReviewState = 'idle' | 'submitting' | 'success' | 'error';

export function StaffReviewPanel({ session }: StaffReviewPanelProps) {
  const [notes, setNotes] = useState(session.reviewNotes ?? '');
  const [currentSession, setCurrentSession] = useState(session);
  const [reviewState, setReviewState] = useState<ReviewState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isReviewed = currentSession.status === 'reviewed';

  async function handleSubmit() {
    if (reviewState === 'submitting' || isReviewed) {
      return;
    }

    setReviewState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/staff/sessions/${encodeURIComponent(currentSession.publicSessionId)}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { session?: IntakeSession; message?: string }
        | null;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.message || 'Unable to mark session reviewed.');
      }

      setCurrentSession(payload.session);
      setNotes(payload.session.reviewNotes ?? '');
      setReviewState('success');
    } catch (error) {
      setReviewState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to mark session reviewed.');
    }
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Staff review</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {isReviewed ? 'Reviewed by staff' : 'Ready for staff review'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Add optional review notes, then mark this intake as reviewed when staff follow-up is complete.
          </p>
        </div>
        {currentSession.reviewedAt ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Reviewed {formatSessionDateTime(currentSession.reviewedAt)}
          </span>
        ) : null}
      </div>

      <label className="mt-5 block text-sm font-medium text-slate-200" htmlFor="staff-review-notes">
        Review notes
      </label>
      <textarea
        id="staff-review-notes"
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value);
          if (reviewState === 'success') {
            setReviewState('idle');
          }
        }}
        disabled={isReviewed || reviewState === 'submitting'}
        placeholder="Optional handoff or follow-up notes"
        className="mt-2 min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isReviewed || reviewState === 'submitting'}
          className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          {isReviewed ? 'Already reviewed' : reviewState === 'submitting' ? 'Saving…' : 'Mark Reviewed'}
        </button>
        {reviewState === 'success' ? <p className="text-sm text-emerald-200">Session marked reviewed.</p> : null}
        {reviewState === 'error' ? <p className="text-sm text-rose-200">{errorMessage}</p> : null}
      </div>

      {currentSession.reviewNotes ? (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Saved notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{currentSession.reviewNotes}</p>
        </div>
      ) : null}
    </article>
  );
}
