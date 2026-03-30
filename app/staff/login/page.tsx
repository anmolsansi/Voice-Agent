import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffLoginForm } from '@/components/staff-login-form';
import { STAFF_ACCESS_COOKIE, isAuthorizedStaffToken } from '@/lib/staff-auth';

export default function StaffLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next?.startsWith('/') ? searchParams.next : '/dashboard';

  if (isAuthorizedStaffToken(cookies().get(STAFF_ACCESS_COOKIE)?.value)) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Staff access</p>
        <h1 className="mt-3 text-3xl font-semibold">Pilot dashboard unlock</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Enter the shared clinic staff access code to open PHI-bearing staff pages and privileged actions.
        </p>

        <div className="mt-6">
          <StaffLoginForm nextPath={nextPath} />
        </div>

        <div className="mt-6 text-sm text-slate-400">
          <p>This pilot guard is intentionally lightweight but real: staff pages require a valid access code before PHI is shown.</p>
          <p className="mt-3">
            Need the patient flow instead?{' '}
            <Link href="/intake/start" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Return to intake start
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
