import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: PlaywrightTestConfig = {
  testDir: path.join(__dirname, 'tests'),
  timeout: 30000,
  workers: 1,
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
  use: {
    baseURL: process.env.TEST_API_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'API Tests',
    },
  ],
  reporter: [
    ['html', { outputFolder: 'test-results/reports/html-report' }],
    ['json', { outputFile: 'test-results/reports/results.json' }],
    ['list'],
    process.env.CI ? ['github'] : ['line'],
  ],
  retries: process.env.CI ? 2 : 0,
  outputDir: 'test-results/artifacts/',
};

export default config;
