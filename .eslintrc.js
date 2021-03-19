module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    include: ['src/'],
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowHigherOrderFunctions: true
    }]
  }
}
