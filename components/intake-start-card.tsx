'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createIntakeSession } from '@/lib/intake-session';

const LAST_SESSION_STORAGE_KEY = 'voice-agent:last-intake-session';

type IntakeStartCardProps = {
  reviewHref: string;
};

export function IntakeStartCard({ reviewHref }: IntakeStartCardProps) {
  const router = useRouter();
  const [resumeSessionId, setResumeSessionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setResumeSessionId(window.localStorage.getItem(LAST_SESSION_STORAGE_KEY) || '');
  }, []);

  function handleStart() {
    setErrorMessage('');
    startTransition(async () => {
      try {
        const session = await createIntakeSession();
        window.localStorage.setItem(LAST_SESSION_STORAGE_KEY, session.publicSessionId);
        router.push(`/intake/${session.publicSessionId}`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to start intake session.');
      }
    });
  }

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Intake flow entry</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Start a real intake session here. If this device already has an in-progress session, patients can jump back into it without re-entering their information.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? 'Starting intake…' : 'Start intake'}
        </button>

        {resumeSessionId ? (
          <button
            type="button"
            onClick={() => router.push(`/intake/${resumeSessionId}`)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Resume previous intake
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => router.push(reviewHref)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Preview review route
        </button>
      </div>

      {resumeSessionId ? (
        <p className="mt-3 text-xs text-slate-500">
          Saved session: <span className="font-mono text-slate-700">{resumeSessionId}</span>
        </p>
      ) : null}

      {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
    </div>
  );
}
