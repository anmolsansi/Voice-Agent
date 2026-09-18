'use client';

import { staffMutation } from '@/lib/staff-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StaffLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleLogout() {
    try {
    const response = await staffMutation('/api/staff/logout', {
      method: 'POST',
    });

    if (!response.ok) { setError('Unable to sign out. Try again.'); return; }
    router.replace('/staff/login');
    router.refresh();
    } catch { setError('Unable to sign out. Try again.'); }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-white"
    >
      {error || 'Sign out'}
    </button>
  );
}
