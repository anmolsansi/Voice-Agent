import { readBoundedBody } from '@/lib/bounded-body';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, getStaffProxyHeaders } from '@/lib/staff-auth';
export async function POST(request: NextRequest) {
  try {
    const body = await readBoundedBody(request, 16384);
    const response = await fetch(`${API_BASE_URL}/api/auth/password`, { method: 'POST', headers: { ...getStaffProxyHeaders(), 'Content-Type': 'application/json' }, body, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    return NextResponse.json({ ok: response.ok, message: result.error?.message }, { status: response.status });
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ message: 'Request too large.' }, { status: 413 });
    return NextResponse.json({ message: 'Service unavailable.' }, { status: 503 }); }
}
