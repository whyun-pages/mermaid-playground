import pluginJs from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettierRecommended, { ignores } from 'eslint-plugin-prettier/recommended';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': ['error', { typeof: true, ignorePattern: '^_' }],
    },
  },
];
