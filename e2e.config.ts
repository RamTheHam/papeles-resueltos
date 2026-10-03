import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
export default {
  tests: 'tests/**/*.e2e.ts',
  targets: [
    { name: 'desktop', engine: web({ ...(process.env.E2E_CDP_ENDPOINT ? { connect: { cdpEndpoint: async () => process.env.E2E_CDP_ENDPOINT! } } : {}), viewport: { width: 1280, height: 900 } }), app: { url: 'http://127.0.0.1:4173', command: { executable: 'node', args: ['scripts/serve.mjs'], log: '.e2e/logs/app.log' } } },
    { name: 'mobile', engine: web({ ...(process.env.E2E_CDP_ENDPOINT ? { connect: { cdpEndpoint: async () => process.env.E2E_CDP_ENDPOINT! } } : {}), viewport: { width: 390, height: 844 } }), app: { url: 'http://127.0.0.1:4173', command: { executable: 'node', args: ['scripts/serve.mjs'], log: '.e2e/logs/app.log' } } }
  ],
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporters: ['list', 'junit', 'markdown'],
  cache: 'off',
  trace: 'retain-on-failure',
} satisfies E2EConfig;
