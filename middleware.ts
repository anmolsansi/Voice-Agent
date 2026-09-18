import { NextRequest, NextResponse } from 'next/server';
import { STAFF_ACCESS_COOKIE, STAFF_CSRF_COOKIE, STAFF_LOGIN_PATH } from '@/lib/staff-auth-shared';
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith('/api/');
  const publicApi = path === '/api/staff/login' || path === '/api/staff/csrf';
  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = process.env.APP_URL ? new URL(process.env.APP_URL).origin : request.nextUrl.origin;
    const cookie = request.cookies.get(STAFF_CSRF_COOKIE)?.value;
    if (request.headers.get('origin') !== origin || !cookie || !/^[a-f0-9]{64}$/.test(cookie) || request.headers.get('x-csrf-token') !== cookie) {
      return NextResponse.json({ message: 'Request verification failed.' }, { status: 403 });
    }
  }
  if (publicApi || /^[a-f0-9]{64}$/.test(request.cookies.get(STAFF_ACCESS_COOKIE)?.value || '')) return NextResponse.next();
  if (isApi) return NextResponse.json({ message: 'Staff authentication required.' }, { status: 401 });
  const target = new URL(STAFF_LOGIN_PATH, request.url);
  target.searchParams.set('next', path + request.nextUrl.search);
  return NextResponse.redirect(target);
}
export const config = { matcher: ['/dashboard/:path*', '/api/staff/:path*', '/api/reports/:path*'] };
