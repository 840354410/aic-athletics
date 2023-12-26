module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    './.eslintrc-auto-import.json'
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'linebreak-style': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'no-inner-declarations': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/multi-word-component-names': 'off',
    'max-len': ['error', { code: 130 }],
    'vue/no-use-v-if-with-v-for': 'off', // 禁用'vue/no-use-v-if-with-v-for'规则
    '@typescript-eslint/ban-ts-comment': 'off'
    // endOfLine: 'auto'
  }
};
