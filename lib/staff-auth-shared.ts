export const STAFF_ACCESS_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-checkincare_session' : 'checkincare_session';
export const STAFF_CSRF_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-checkincare_csrf' : 'checkincare_csrf';
export const STAFF_LOGIN_PATH = '/staff/login';
