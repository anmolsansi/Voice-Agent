import { readBoundedBody } from '@/lib/bounded-body';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/staff-auth';
import { STAFF_ACCESS_COOKIE, STAFF_CSRF_COOKIE } from '@/lib/staff-auth-shared';
export async function POST(request: NextRequest) {
  try {
    const body = await readBoundedBody(request, 16384);
    const upstream = await fetch(`${API_BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const result = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ message: result.error?.message || 'Unable to sign in.' }, { status: upstream.status, headers: upstream.status === 429 ? { 'Retry-After': '900' } : {} });
    const response = NextResponse.json({ ok: true, user: result.user }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(STAFF_ACCESS_COOKIE, result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 43200 });
    response.cookies.delete(STAFF_CSRF_COOKIE);
    return response;
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ message: 'Request too large.' }, { status: 413 });
    return NextResponse.json({ message: 'Sign-in service unavailable.' }, { status: 503 }); }
}
