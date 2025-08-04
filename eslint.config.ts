import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['jest.config.js'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 2020,
      globals: {
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],

      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-console': 'off',
      'no-duplicate-imports': 'error',
      'no-unassigned-vars': 'error',
      'no-useless-assignment': 'error',
      'no-eval': 'error',
      'prefer-const': 'error',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    files: ['**/*.ts'],
  },
];
