const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },    plugins: {
      '@typescript-eslint': tseslint,
    },rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-var-requires': 'error',      // General ESLint rules
      'no-console': 'off', // Allow console in tests
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'off', // Handled by TypeScript
      'no-useless-escape': 'error',

      // Code style rules
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'indent': ['error', 2],
      'max-len': ['warn', { code: 120, ignoreStrings: true, ignoreComments: true }],
    },
  },  {
    files: ['*.config.js', '*.config.ts', 'eslint.config.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],    rules: {
      // Allow any types in test files for flexibility
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow console.log in tests for debugging
      'no-console': 'off',
      // Allow unused vars in test files (often used for destructuring)
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // Allow empty patterns in tests
      'no-empty-pattern': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'test-results/',
      'enterprise-reports/',
      'coverage/',
      '*.js',
      '!*.config.js',
      'package-lock.json',
    ],
  },
];
