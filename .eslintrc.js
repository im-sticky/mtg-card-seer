/*eslint-env node*/

module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
    'brace-style': [
      'error',
      '1tbs',
    ],
    'curly': [
      'error',
      'all',
    ],
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
        'offsetTernaryExpressions': true
      }
    ],
    'keyword-spacing': [
      'error',
      {
        'after': true,
        'before': true,
      },
    ],
    'newline-after-var': [
      'error',
      'always',
    ],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
      'error',
      'never',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
  },
};
