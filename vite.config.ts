/**
 * Vite Configuration for TestFusion-Enterprise
 *
 * Provides modern build tooling for TypeScript compilation,
 * development server, and build optimization.
 * Note: This is a Node.js-based testing framework, not a browser library.
 */
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'tests/index.ts'),
      name: 'TestFusionEnterprise',
      fileName: 'testfusion-enterprise',
      formats: ['cjs'], // Only CommonJS for Node.js
    },
    rollupOptions: {
      external: [
        // Playwright and testing dependencies
        '@playwright/test',
        'playwright',

        // Node.js built-in modules
        'crypto',
        'fs',
        'path',
        'os',
        'util',
        'stream',
        'events',
        'buffer',
        'url',
        'querystring',
        'http',
        'https',
        'net',
        'tls',
        'child_process',

        // External dependencies
        'dotenv',
        'fs-extra',
      ],
      output: {
        globals: {
          '@playwright/test': 'PlaywrightTest',
          playwright: 'playwright',
          dotenv: 'dotenv',
          crypto: 'crypto',
          fs: 'fs',
          path: 'path',
          os: 'os',
          'fs-extra': 'fsExtra',
        },
      },
    },
    sourcemap: true,
    minify: false, // Keep unminified for debugging
    target: 'node18',
    ssr: true, // Server-side rendering mode for Node.js
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'tests'),
      '@utils': resolve(__dirname, 'tests/utils'),
      '@fixtures': resolve(__dirname, 'tests/fixtures'),
      '@models': resolve(__dirname, 'tests/models'),
      '@config': resolve(__dirname, 'tests/config'),
      '@constants': resolve(__dirname, 'tests/constants'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test-results/', 'playwright-report/', 'coverage/'],
    },
  },
});
