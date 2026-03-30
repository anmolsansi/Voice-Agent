import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.PORT || '3001'}`;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch(`${API_BASE_URL}/api/intake/sessions/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}
