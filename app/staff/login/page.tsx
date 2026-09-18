import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StaffLoginForm } from '@/components/staff-login-form';
import { getStaffUser } from '@/lib/staff-auth';

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next?.startsWith('/dashboard') && !searchParams.next.includes('\\') ? searchParams.next : '/dashboard';

  const user = await getStaffUser().catch(() => null);
  if (user) redirect(user.mustChangePassword ? '/staff/password' : nextPath);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Staff access</p>
        <h1 className="mt-3 text-3xl font-semibold">Staff sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Sign in with your individual clinic account.
        </p>

        <div className="mt-6">
          <StaffLoginForm nextPath={nextPath} />
        </div>

        <div className="mt-6 text-sm text-slate-400">
          <p>Use synthetic patient information only during foundation evaluation.</p>
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
