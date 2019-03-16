"use strict";

const Router = require("koa-router");

const ossApi = new Router({ prefix: "/oss" });
ossApi.get("/", async ctx => {
  ctx.json({
    msg: "hello plugin"
  });
});

exports.ossApi = ossApi;
