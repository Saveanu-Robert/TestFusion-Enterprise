module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'playwright'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // General ESLint rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Code style rules
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'indent': ['error', 2],
    'max-len': ['warn', { code: 120, ignoreStrings: true, ignoreComments: true }],

    // Playwright specific rules
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-nested-step': 'warn',
    'playwright/no-networkidle': 'warn',
    'playwright/no-page-pause': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-useless-await': 'error',
    'playwright/valid-expect': 'error',
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['tests/**/*.ts'],
      rules: {
        // Allow any types in test files for flexibility
        '@typescript-eslint/no-explicit-any': 'off',
        // Allow console.log in tests for debugging
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'test-results/',
    'playwright-report/',
    '*.js',
  ],
};
