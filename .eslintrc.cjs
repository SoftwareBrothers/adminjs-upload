module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: [
    '*/build/**/*',
    '*/dist/**/*',
    '*.json',
    '*.txt',
    '*.mp4',
    'yarn.lock',
    '*.yaml',
    '*.md',
    '*/public/**/*',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 20,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    semi: ['error', 'never'],
    'no-unused-vars': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'import/prefer-default-export': 'off',
    indent: [
      'error',
      2,
    ],
    'linebreak-style': ['error', 'unix'],
    'object-curly-newline': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [{
    files: ['*.tsx'],
    rules: {
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react/function-component-definition': 'off',
      'react/require-default-props': 'off',
    },
  }, {
    files: ['./src/**/*.spec.ts', '**/*/spec/**/*.ts'],
    rules: {
      'no-unused-expressions': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  }],
}
