import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4173);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:${port}`,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: executablePath || undefined,
      args: executablePath ? ['--in-process-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [],
    },
  },
  projects: [
    { name: 'mock-desktop', testMatch: '**/*.desktop.mock.spec.ts', use: { viewport: { width: 1365, height: 900 } } },
    { name: 'mock-mobile', testMatch: '**/*.mobile.mock.spec.ts', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'node e2e/support/server.mjs',
    url: `http://127.0.0.1:${port}/`,
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
