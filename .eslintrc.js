module.exports = {
  "extends": "standard",
  "plugins": ["jest"],
  "rules": {
    "semi": ["warn", "always"],
    "quotes": ["warn", "double"],
    "eol-last": 0,
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  },
  "env": {
    "jest": true
  }
};