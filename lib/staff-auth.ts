export const STAFF_ACCESS_COOKIE = 'checkincare_staff_access';
export const STAFF_ACCESS_HEADER = 'x-staff-access-token';
export const STAFF_LOGIN_PATH = '/staff/login';

export function getConfiguredStaffAccessToken() {
  return process.env.STAFF_ACCESS_TOKEN?.trim() || '';
}

export function isStaffAccessConfigured() {
  return getConfiguredStaffAccessToken().length > 0;
}

export function isAuthorizedStaffToken(value: string | null | undefined) {
  const configuredToken = getConfiguredStaffAccessToken();

  if (!configuredToken) {
    return false;
  }

  return value === configuredToken;
}

export function getStaffProxyHeaders(): HeadersInit {
  const token = getConfiguredStaffAccessToken();
  return token ? { [STAFF_ACCESS_HEADER]: token } : {};
}
