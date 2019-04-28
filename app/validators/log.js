"use strict";

const { Rule, checkDateFormat } = require("lin-mizar");
const { PaginateValidator } = require("./common");
const { isOptional } = require("../libs/util");

class LogFindValidator extends PaginateValidator {
  constructor () {
    super();
    this.name = new Rule("isOptional");
  }

  validateStart (data) {
    const start = data.query.start;
    // 如果 start 为可选
    if (isOptional(start)) {
      return true;
    }
    const ok = checkDateFormat(start);
    if (ok) {
      return ok;
    } else {
      return [false, "请输入正确格式开始时间", "start"];
    }
  }

  validateEnd (data) {
    if (!data.query) {
      return true;
    }
    const end = data.query.start;
    if (isOptional(end)) {
      return true;
    }
    const ok = checkDateFormat(end);
    if (ok) {
      return ok;
    } else {
      return [false, "请输入正确格式结束时间", "end"];
    }
  }
}

module.exports = {
  LogFindValidator
};
