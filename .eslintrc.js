module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    include: ['src/'],
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  }
}
