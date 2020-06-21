// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '**/?(*.)(spec).js?(x)'
    // '**/?(*.)(spec|test).js?(x)'
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
};
