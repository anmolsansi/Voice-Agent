import { NextResponse } from 'next/server';
import { API_BASE_URL, getStaffProxyHeaders } from '@/lib/staff-auth';
import { STAFF_ACCESS_COOKIE, STAFF_CSRF_COOKIE } from '@/lib/staff-auth-shared';
export async function POST() {
  try {
    const upstream = await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', headers: getStaffProxyHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!upstream.ok && upstream.status !== 401) return NextResponse.json({ message: 'Unable to revoke session. Try again.' }, { status: 503 });
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(STAFF_ACCESS_COOKIE);
    response.cookies.delete(STAFF_CSRF_COOKIE);
    return response;
  } catch { return NextResponse.json({ message: 'Unable to revoke session. Try again.' }, { status: 503 }); }
}
