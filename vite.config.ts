/**
 * Vite Configuration for TestFusion-Enterprise
 *
 * Provides modern build tooling for TypeScript compilation,
 * development server, and build optimization.
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
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@playwright/test', 'dotenv'],
      output: {
        globals: {
          '@playwright/test': 'PlaywrightTest',
          dotenv: 'dotenv',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
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
