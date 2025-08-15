// eslint.config.mjs
import js from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import pluginTs from '@typescript-eslint/eslint-plugin';

export default [
  // 무시 경로
  { ignores: ['dist/**', 'drizzle/**', 'node_modules/**'] },

  // JS 기본 권장
  js.configs.recommended,

  // TS 규칙
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        // 타입체커 연동은 나중 단계에서 켬 (project 옵션)
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: { '@typescript-eslint': pluginTs },
    rules: {
      // 품질
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'multi-line'],
      'no-console': 'warn',
      // TS 스타일
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'off', // 초기 편의, 필요시 'warn'
    },
  },
];
