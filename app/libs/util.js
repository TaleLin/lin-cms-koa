"use strict";

const { toSafeInteger, get, isInteger } = require("lodash");
const { ParametersException } = require("lin-mizar");

function getSafeParamId (ctx) {
  const id = toSafeInteger(get(ctx.params, "id"));
  if (!isInteger(id)) {
    throw new ParametersException({
      msg: "路由参数错误"
    });
  }
  return id;
}

module.exports = { getSafeParamId };
