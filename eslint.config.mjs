import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import eslintPluginVue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      globals: {
        Models: true,
        AdcpModels: true
      },
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  }
);
