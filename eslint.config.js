import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'packages/preview-ui/upstream/**',
      'packages/preview-ui/src/animate-sidebar/runtime/**',
      'packages/preview-ui/src/site/auth-registry/**',
      'packages/preview-ui/src/admin-controls/runtime/**',
      'plugins/sidebar-styles.js',
      'plugins/motion-preference-plugin.js',
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'public/docs/**',
      'projects/*/assets/**',
      'projects/*/data/**',
      'projects/*/docs/**',
      'projects/*/mobile/**',
      'projects/*/.backups/**',
    ],
  },
  js.configs.recommended,
  {
    files: [
      'apps/web/src/features/platform/**/*.{ts,tsx}',
      'apps/web/src/features/orders/**/*.{ts,tsx}',
      'apps/web/src/features/appearance/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['antd', 'antd/*', '@/ui/ant'],
              message:
                '后台组件必须使用 @preview/ui/admin 的固定 Rental OS 实现。主题适配和原组件内部兼容逻辑不属于页面职责。',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='table']",
          message: '使用 Rental OS 的公共 Table/DataTable，不在后台页面重写表格。',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: '使用 Rental OS 的公共 Select，不使用浏览器原生下拉。',
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/preview-ui/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/web/vite-chunks.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['projects/*/page-definitions.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      'scripts/**/*.{js,cjs,mjs}',
      'apps/api/**/*.mjs',
      'plugins/**/*.js',
      'vite.config.js',
      'playwright.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['tests/**/*.js', 'vitest.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  prettier,
];
