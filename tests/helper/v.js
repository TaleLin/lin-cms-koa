const { get } = require("lodash");

class V {
  constructor (data) {
    this.data = data || {};
  }

  get () {
    return get(this.data);
  }
}

exports.V = V;
