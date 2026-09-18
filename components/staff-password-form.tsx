'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { staffMutation } from '@/lib/staff-client';
export function StaffPasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    try {
      const response = await staffMutation('/api/staff/password', { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to change password.');
      router.replace('/dashboard'); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'Service unavailable.'); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-4">
    <label className="block">Current password<input className="mt-2 block w-full rounded bg-slate-900 p-3" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} /></label>
    <label className="block">New password<input className="mt-2 block w-full rounded bg-slate-900 p-3" type="password" autoComplete="new-password" required minLength={15} maxLength={128} value={newPassword} onChange={(e) => setNew(e.target.value)} /></label>
    <p className="text-sm">Use 15–128 characters. Other sessions will be signed out.</p>
    <button disabled={pending} className="rounded bg-cyan-400 p-3 text-slate-950">{pending ? 'Saving…' : 'Change password'}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
