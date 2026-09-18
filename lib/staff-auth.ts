import 'server-only';
import { cookies } from 'next/headers';
import { STAFF_ACCESS_COOKIE } from './staff-auth-shared';
export { STAFF_ACCESS_COOKIE, STAFF_LOGIN_PATH } from './staff-auth-shared';
export const API_BASE_URL = process.env.INTAKE_API_BASE_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`;
export type StaffUser = { id: string; email: string; displayName: string; role: 'admin' | 'care_staff'; disabled: boolean; mustChangePassword: boolean };
export function getStaffProxyHeaders(): Record<string, string> {
  const token = cookies().get(STAFF_ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function getStaffUser(): Promise<StaffUser | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: getStaffProxyHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Staff authentication service unavailable.');
  return (await response.json()).user;
}
