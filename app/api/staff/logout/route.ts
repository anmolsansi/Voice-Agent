import { NextRequest, NextResponse } from 'next/server';
import { STAFF_ACCESS_COOKIE } from '@/lib/staff-auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const isSecureRequest = request.nextUrl.protocol === 'https:';
  response.cookies.set({
    name: STAFF_ACCESS_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest,
    path: '/',
    maxAge: 0,
  });

  return response;
}
