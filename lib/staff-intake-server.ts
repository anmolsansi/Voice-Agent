import 'server-only';
import { IntakeSession } from '@/lib/intake-session';
import { getStaffProxyHeaders } from '@/lib/staff-auth';

const API_BASE_URL = process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`;

export async function listStaffIntakeSessions() {
  const response = await fetch(`${API_BASE_URL}/api/intake/sessions`, {
    cache: 'no-store',
    headers: getStaffProxyHeaders(),
  });

  if (!response.ok) {
    throw new Error('Unable to load intake sessions.');
  }

  const payload = (await response.json()) as { items: IntakeSession[]; total: number };
  return payload.items;
}

export async function getStaffIntakeSession(publicSessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/staff/sessions/${encodeURIComponent(publicSessionId)}`,
    {
      cache: 'no-store',
      headers: getStaffProxyHeaders(),
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error('Unable to load intake session.');
  }

  const payload = (await response.json()) as { session: IntakeSession };
  return payload.session;
}
