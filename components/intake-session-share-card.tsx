'use client';

import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { getIntakeResumePath, getIntakeResumeUrl } from '@/lib/intake-links';

type IntakeSessionShareCardProps = {
  publicSessionId: string;
  title?: string;
  description?: string;
};

export function IntakeSessionShareCard({
  publicSessionId,
  title = 'Continue on your phone',
  description = 'Scan this QR code to open the same intake session on a mobile device, or copy the link to share it directly.',
}: IntakeSessionShareCardProps) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const resumePath = useMemo(() => getIntakeResumePath(publicSessionId), [publicSessionId]);
  const resumeUrl = useMemo(() => getIntakeResumeUrl(publicSessionId, origin), [origin, publicSessionId]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setCopyState('copied');
      window.setTimeout(() => {
        setCopyState((current) => (current === 'copied' ? 'idle' : current));
      }, 2000);
    } catch {
      setCopyState('error');
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resume path</p>
            <p className="font-mono text-xs text-slate-700 sm:text-sm">{resumePath}</p>
            <p className="text-xs text-slate-500">Open or share this link: <span className="font-mono text-slate-700">{resumeUrl}</span></p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {copyState === 'copied' ? 'Link copied' : 'Copy link'}
            </button>
            <a
              href={resumePath}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Open link
            </a>
          </div>

          {copyState === 'error' ? (
            <p className="text-sm text-rose-600">Unable to copy the session link automatically. You can still copy it manually from the text above.</p>
          ) : null}
        </div>

        <div className="flex justify-center lg:min-w-[220px]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <QRCodeSVG value={resumeUrl} size={180} marginSize={3} bgColor="transparent" fgColor="#0f172a" title={`Resume intake session ${publicSessionId}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
