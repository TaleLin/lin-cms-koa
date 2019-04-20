"use strict";

const Koa = require("koa");
const KoaBodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const { config } = require("lin-mizar/lin/config");

function applyCors (app) {
  // 跨域
  app.use(cors());
}

function applyBodyParse (app) {
  // 参数解析
  app.use(KoaBodyParser());
}

function indexPage (app) {
  app.context.manager.loader.mainRouter.get("/", async ctx => {
    ctx.type = "html";
    ctx.body = `<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} a{color:#2E5CD5;cursor:
      pointer;text-decoration: none} a:hover{text-decoration:underline; } body{ background: #fff; font-family:
      "Century Gothic","Microsoft yahei"; color: #333;font-size:18px;} h1{ font-size: 100px; font-weight: normal;
      margin-bottom: 12px; } p{ line-height: 1.6em; font-size: 42px }</style><div style="padding: 24px 48px;"><p>
      Lin <br/><span style="font-size:30px">心上无垢，林间有风。</span></p></div> `;
  });
}

async function createApp () {
  const app = new Koa();
  applyBodyParse(app);
  applyCors(app);
  config.initApp(app);
  const { log, error, Lin } = require("lin-mizar");
  app.use(log);
  app.on("error", error);
  const lin = new Lin();
  await lin.initApp(app, true, true, null, null, null);
  indexPage(app);
  return app;
}

module.exports = { createApp };
