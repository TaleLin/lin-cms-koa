"use strict";

const { HttpException } = require("lin-mizar");
const assert = require("assert");
const { isInteger } = require("lodash");

class BookNotFound extends HttpException {
  constructor (ex) {
    super();
    this.code = 404;
    this.msg = "没有找到相关图书";
    this.errorCode = 80010;
    if (ex && ex.code) {
      assert(isInteger(ex.code));
      this.code = ex.code;
    }
    if (ex && ex.msg) {
      this.msg = ex.msg;
    }
    if (ex && ex.errorCode) {
      assert(isInteger(ex.errorCode));
      this.errorCode = ex.errorCode;
    }
  }
}

module.exports = { BookNotFound };
