import eslint from '@eslint/js';
import * as parser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

const commonSettings = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      // Browser globals
      window: 'readonly',
      document: 'readonly',
      console: 'readonly',
      localStorage: 'readonly',
      setTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      requestAnimationFrame: 'readonly',
      // React globals
      React: 'readonly',
      JSX: 'readonly',
    },
  },
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
};

const typescript = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: parser,
    parserOptions: {
      project: ['./tsconfig.json', './client/tsconfig.json', './server/tsconfig.json'],
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', './client/tsconfig.json', './server/tsconfig.json'],
      },
    },
  },
  plugins: {
    '@typescript-eslint': tseslintPlugin,
    import: importPlugin,
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
  },
};

const react = {
  files: ['client/**/*.{js,jsx,ts,tsx}'],
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    prettier: prettierPlugin,
    import: importPlugin,
    'jsx-a11y': jsxA11yPlugin,
    '@typescript-eslint': tseslintPlugin,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  languageOptions: {
    parser: parser,
    parserOptions: {
      project: './tsconfig.json',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prettier/prettier': 'error',
    //'import/no-unresolved': 'error',
    //'import/no-extraneous-dependencies': 'error',
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'error',
    //'react/no-unused-prop-types': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      },
    ],
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-role': 'error',
  },
};

const node = {
  files: ['server/**/*.{js,ts}'],
  plugins: {
    prettier: prettierPlugin,
    '@typescript-eslint': tseslintPlugin,
  },
  languageOptions: {
    parser: parser,
    parserOptions: {
      project: './tsconfig.json',
    },
    globals: {
      // Node.js globals
      process: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      module: 'readonly',
      require: 'readonly',
    },
  },
  rules: {
    'prettier/prettier': 'error',
  },
};

export default [eslint.configs.recommended, commonSettings, typescript, react, node];
