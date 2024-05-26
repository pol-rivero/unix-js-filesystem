module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'project': './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    '@stylistic',
    'only-warn'
  ],
  extends: [
    'eslint:all',
    'plugin:@typescript-eslint/all',
  ],
  rules: {
    'one-var': 'off',
    'id-length': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'prefer-template': 'off',
    'no-underscore-dangle': 'off',
    'no-undefined': 'off',
    'no-void': 'off',
    'sort-imports': 'off',
    'max-statements': [ 'error', 30 ],
    'no-constant-condition': 'off',
    'func-style': [ 'error', 'declaration', { 'allowArrowFunctions': true } ],
    'no-await-in-loop': 'off',
    '@typescript-eslint/no-unused-vars': [ 'error', { 'argsIgnorePattern': '^_' } ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/explicit-function-return-type': [ 'error', { 'allowExpressions': true } ],
    '@typescript-eslint/consistent-type-imports': [ 'error', { 'fixStyle': 'inline-type-imports' } ],
    '@typescript-eslint/no-loop-func': 'off',
  }
}
