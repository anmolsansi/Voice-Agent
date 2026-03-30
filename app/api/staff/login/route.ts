import { NextRequest, NextResponse } from 'next/server';
import {
  STAFF_ACCESS_COOKIE,
  isAuthorizedStaffToken,
  isStaffAccessConfigured,
} from '@/lib/staff-auth';

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { token?: string } | null;
  const submittedToken = payload?.token?.trim() || '';

  if (!isStaffAccessConfigured()) {
    return NextResponse.json(
      { message: 'Staff access is not configured. Set STAFF_ACCESS_TOKEN before using the dashboard.' },
      { status: 503 },
    );
  }

  if (!isAuthorizedStaffToken(submittedToken)) {
    return NextResponse.json({ message: 'Invalid staff access code.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const isSecureRequest = request.nextUrl.protocol === 'https:';

  response.cookies.set({
    name: STAFF_ACCESS_COOKIE,
    value: submittedToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest,
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
