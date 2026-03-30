import { NextRequest, NextResponse } from 'next/server';
import {
  STAFF_ACCESS_COOKIE,
  STAFF_LOGIN_PATH,
  isAuthorizedStaffToken,
} from '@/lib/staff-auth';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedStaffPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isStaffAuthApi = pathname === '/api/staff/login' || pathname === '/api/staff/logout';
  const isProtectedStaffApi = pathname.startsWith('/api/staff/') && !isStaffAuthApi;

  if (!isProtectedStaffPage && !isProtectedStaffApi) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (isAuthorizedStaffToken(cookieValue)) {
    return NextResponse.next();
  }

  if (isProtectedStaffApi) {
    return NextResponse.json({ message: 'Staff authentication required.' }, { status: 401 });
  }

  const loginUrl = new URL(STAFF_LOGIN_PATH, request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/staff/:path*'],
};
