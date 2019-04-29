"use strict";

const { LinRouter, groupRequired, NotFound } = require("lin-mizar");
const { LogFindValidator } = require("../../validators/log");
const { PaginateValidator } = require("../../validators/common");
const { LogDao } = require("../../dao/log");

const log = new LinRouter({
  prefix: "/cms/log"
});

const logDao = new LogDao();

log.linGet(
  "getLogs",
  "/",
  {
    auth: "查询所有日志",
    module: "日志",
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new LogFindValidator().validate(ctx);
    const { rows, total } = await logDao.getLogs(v);
    if (!rows || rows.length < 1) {
      throw new NotFound({
        msg: "没有找到相关日志"
      });
    }
    ctx.json({
      total_nums: total,
      collection: rows
    });
  }
);

log.linGet(
  "getUserLogs",
  "/search",
  {
    auth: "搜索日志",
    module: "日志",
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new LogFindValidator().validate(ctx);
    const keyword = v.get("query.keyword", false, "");
    const { rows, total } = await logDao.searchLogs(v, keyword);
    if (!rows || rows.length < 1) {
      throw new NotFound({
        msg: "没有找到相关日志"
      });
    }
    ctx.json({
      total_nums: total,
      collection: rows
    });
  }
);

log.linGet(
  "getUsers",
  "/users",
  {
    auth: "查询日志记录的用户",
    module: "日志",
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const arr = await logDao.getUserNames(
      v.get("query.page"),
      v.get("query.count")
    );
    ctx.json(arr);
  }
);

module.exports = { log };
