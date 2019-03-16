"use strict";

// 不要以controller来命名
const { ossApi } = require("./controller");
const { Image } = require("./model");

exports.ossApi = ossApi;
exports.Image = Image;
