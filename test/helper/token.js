const fs = require('fs');

exports.saveTokens = function saveTokens (data) {
  fs.writeFileSync('../../tokens.json', JSON.stringify(data));
};

exports.getToken = function getToken (type = 'access_token') {
  const buf = fs.readFileSync('../../tokens.json');
  return JSON.parse(buf.toString())[type];
};
