module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Add any custom rules here
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
}; 