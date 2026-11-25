import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './browser-tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8000', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: { command: 'python3 -m http.server 8000 --bind 127.0.0.1', url: 'http://127.0.0.1:8000', reuseExistingServer: false }
});
