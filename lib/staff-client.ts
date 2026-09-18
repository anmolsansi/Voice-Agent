export async function staffMutation(url: string, init: RequestInit = {}) {
  const csrfResponse = await fetch('/api/staff/csrf', { cache: 'no-store' });
  if (!csrfResponse.ok) throw new Error('Unable to verify this request. Refresh and try again.');
  const { csrfToken } = await csrfResponse.json();
  return fetch(url, { ...init, method: init.method || 'POST', headers: { ...init.headers, 'X-CSRF-Token': csrfToken } });
}
