import { NextRequest, NextResponse } from 'next/server';
import { getStaffProxyHeaders } from '@/lib/staff-auth';

const API_BASE_URL = process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`;

export async function GET(
  _request: NextRequest,
  { params }: { params: { publicSessionId: string } },
) {
  const response = await fetch(
    `${API_BASE_URL}/api/intake/sessions/${encodeURIComponent(params.publicSessionId)}/pdf`,
    {
      cache: 'no-store',
      headers: getStaffProxyHeaders(),
    },
  );

  const body = Buffer.from(await response.arrayBuffer());

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/pdf',
      'Content-Disposition': response.headers.get('content-disposition') || 'inline',
    },
  });
}
