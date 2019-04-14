"use strict";

const { Rule, checkDateFormat } = require("lin-mizar");
const { PaginateValidator } = require("./common");

class LogFindValidator extends PaginateValidator {
  constructor () {
    super();
    this.name = new Rule("isOptional");
    this.start = [
      new Rule("isOptional"),
      new Rule(checkDateFormat, "请输入正确格式开始时间")
    ];
    this.end = [
      new Rule("isOptional"),
      new Rule(checkDateFormat, "请输入正确格式开始时间")
    ];
  }
}

exports.LogFindValidator = LogFindValidator;
