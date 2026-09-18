import { test, expect } from '@playwright/test';
const { setup, query, closePool } = require('../helpers/database.cjs');
const password = 'Synthetic-only-test-password-changed';
test.beforeEach(async () => { await setup(); await query('TRUNCATE intake_session_state CASCADE'); });
test.afterAll(closePool);
async function login(page: import('@playwright/test').Page) {
  await page.goto('/staff/login');
  await page.getByLabel('Email').fill('test@example.test');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}
test('sign in, forced password change, dashboard, logout and mobile layout', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message));
  await query("UPDATE staff_users SET must_change_password=true WHERE email='test@example.test'");
  await login(page); await expect(page).toHaveURL(/\/staff\/password$/);
  await page.getByLabel('Current password').fill(password);
  await page.getByLabel('New password').fill(password + '-new');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Synthetic evaluation only.', { exact: false })).toBeVisible();
  await page.screenshot({ path: info.outputPath('dashboard.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('dashboard-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/staff\/login$/);
  await page.goto('/dashboard'); await expect(page).toHaveURL(/\/staff\/login/);
  expect(errors).toEqual([]);
});
test('patient entry, reload, submit, authenticated staff review and PDF', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/intake/start');
  await page.getByRole('button', { name: 'Start intake', exact: true }).click();
  await expect(page).toHaveURL(/\/intake\/intake_/);
  const sessionId = new URL(page.url()).pathname.split('/').pop()!;
  const fields: [string,string][] = [['patient.firstName','Synthetic'], ['patient.lastName','Browser'], ['patient.dateOfBirth','1990-01-01'], ['patient.phone','3125550100'], ['visit.chiefComplaint','Synthetic follow-up test'], ['consent.signatureName','Synthetic Browser']];
  for (const [name, value] of fields) {
    await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/intake/fields') && r.ok()), page.locator(`[name="${name}"]`).fill(value)]);
  }
  await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/intake/fields') && r.ok()), page.locator('[name="patient.sexAtBirth"]').selectOption('female')]);
  await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/intake/fields') && r.ok()), page.locator('[name="consent.treatmentConsent"]').check()]);
  await page.reload(); await expect(page.locator('[name="patient.firstName"]')).toHaveValue('Synthetic');
  await page.getByRole('link', { name: 'Continue to review', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Submit intake', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Submit intake', exact: true }).click();
  await expect(page).toHaveURL(/\/intake\/complete/);
  await login(page); await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto(`/dashboard/intake/${sessionId}`);
  await page.getByLabel('Review notes').fill('Synthetic browser review');
  await page.getByRole('button', { name: 'Mark Reviewed' }).click();
  await expect(page.getByText('Session marked reviewed.', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('review.png') });
  const pdf = await page.request.get(`/api/staff/sessions/${sessionId}/pdf`);
  expect(pdf.status()).toBe(200); expect((await pdf.body()).subarray(0,4).toString()).toBe('%PDF');
  await page.reload(); await expect(page.getByLabel('Review notes')).toHaveValue('Synthetic browser review');
  expect(errors).toEqual([]);
});
test('CSRF and expired or disabled sessions block browser and report access', async ({ page }) => {
  expect((await page.request.post('/api/staff/login', { data: { email: 'test@example.test', password } })).status()).toBe(403);
  await login(page); await expect(page).toHaveURL(/\/dashboard$/);
  expect((await page.request.post('/api/staff/logout')).status()).toBe(403);
  await query("UPDATE staff_sessions SET last_seen_at=now()-interval '31 minutes'");
  expect((await page.request.get('/api/reports/metrics')).status()).toBe(401);
  await page.goto('/dashboard'); await expect(page).toHaveURL(/\/staff\/login/);
  await login(page); await expect(page).toHaveURL(/\/dashboard$/);
  await query('UPDATE staff_users SET disabled=true');
  expect((await page.request.get('/api/reports/export')).status()).toBe(401);
  await page.goto('/dashboard'); await expect(page).toHaveURL(/\/staff\/login/);
});
