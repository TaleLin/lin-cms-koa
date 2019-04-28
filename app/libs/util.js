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

function isOptional (val) {
  // undefined , null , ""  , "    ", 皆通过
  if (val === void 0) {
    return true;
  }
  if (val === null) {
    return true;
  }
  if (typeof val === "string") {
    return val === "" || val.trim() === "";
  }
  return false;
}

module.exports = { getSafeParamId, isOptional };
