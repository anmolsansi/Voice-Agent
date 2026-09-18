import { defineConfig } from '@playwright/test';
if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL must be an isolated migrated synthetic database.');
const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, STAFF_AUTH_MODE: 'session', APP_URL: 'http://127.0.0.1:3100', INTAKE_API_BASE_URL: 'http://127.0.0.1:3101', BACKEND_PORT: '3101', FRONTEND_PORT: '3100', NODE_ENV: 'development', ALLOW_MEMORY_FALLBACK: 'false' } as Record<string, string>;
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 60000, retries: 0,
  outputDir: '/tmp/checkincare-browser-results',
  use: { baseURL: 'http://127.0.0.1:3100', viewport: { width: 1280, height: 900 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run dev:backend', url: 'http://127.0.0.1:3101/ready', env, reuseExistingServer: false, timeout: 30000 },
    { command: 'npm run dev:frontend', url: 'http://127.0.0.1:3100/staff/login', env, reuseExistingServer: false, timeout: 120000 },
  ],
});
