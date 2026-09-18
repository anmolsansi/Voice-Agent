import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { STAFF_CSRF_COOKIE } from '@/lib/staff-auth-shared';
export function GET(request: NextRequest) {
  const existing = request.cookies.get(STAFF_CSRF_COOKIE)?.value;
  const csrfToken = /^[a-f0-9]{64}$/.test(existing || '') ? existing! : randomBytes(32).toString('hex');
  const response = NextResponse.json({ csrfToken }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(STAFF_CSRF_COOKIE, csrfToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 43200 });
  return response;
}
