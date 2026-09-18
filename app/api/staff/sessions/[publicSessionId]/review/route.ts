import { readBoundedBody } from '@/lib/bounded-body';
import { NextRequest, NextResponse } from 'next/server';
import { getStaffProxyHeaders } from '@/lib/staff-auth';

const API_BASE_URL = process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`;

export async function POST(
  request: NextRequest,
  { params }: { params: { publicSessionId: string } },
) {
  try {
  const body = await readBoundedBody(request, 256 * 1024);
  const response = await fetch(
    `${API_BASE_URL}/api/staff/sessions/${encodeURIComponent(params.publicSessionId)}/review`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getStaffProxyHeaders(),
      },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    },
  );

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
  } catch (error) {
    return NextResponse.json({ message: error instanceof RangeError ? 'Request too large.' : 'Service unavailable.' }, { status: error instanceof RangeError ? 413 : 503 });
  }
}
