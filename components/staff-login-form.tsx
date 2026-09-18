'use client';

import { staffMutation } from '@/lib/staff-client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function StaffLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await staffMutation('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; user?: { mustChangePassword: boolean } } | null;

      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to verify credentials.');
      }

      router.replace(payload?.user?.mustChangePassword ? '/staff/password' : nextPath || '/dashboard');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">Email
        <input name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl bg-slate-950 p-3" />
      </label>
      <div>
        <label htmlFor="staff-access-token" className="block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="staff-access-token"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
          placeholder="Enter password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
    </form>
  );
}
