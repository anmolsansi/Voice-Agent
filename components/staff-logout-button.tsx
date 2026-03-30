'use client';

import { useRouter } from 'next/navigation';

export function StaffLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/staff/logout', {
      method: 'POST',
    });

    router.replace('/staff/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-white"
    >
      Lock dashboard
    </button>
  );
}
