const path = require('path');

module.exports = {
  extends: [
    'trendmicro',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: {
          resolve: {
            modules: [
              path.resolve(__dirname, 'src'),
              'node_modules'
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx']
          }
        }
      }
    }
  },
  rules: {
    'max-lines-per-function': [1, {
      max: 1000,
      skipBlankLines: true,
      skipComments: true
    }],
    'react/jsx-no-bind': [1, {
      allowArrowFunctions: true
    }],
    'react/prefer-stateless-function': 0,
    'react/no-access-state-in-setstate': 0,
    'class-methods-use-this': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-var-requires': 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    'camelcase': [1, { 'properties': 'never' }]
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks'
  ],
  root: true
};
