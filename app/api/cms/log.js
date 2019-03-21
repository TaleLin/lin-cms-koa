"use strict";

const {
  LinRouter,
  groupRequired,
  NotFound,
  ParametersException,
  paginate
} = require("lin-cms");
const { LogFindValidator } = require("../../validators/cms");
const { get } = require("lodash");
const { LogDao } = require("../../dao/log");

const log = new LinRouter({
  prefix: "/cms/log"
});

exports.log = log;

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
    const { start, count } = paginate(ctx);
    const { rows, total } = await logDao.getLogs(v, start, count);
    if (total < 1) {
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
    const keyword = get(ctx.request.query, "keyword");
    if (!keyword || keyword === "") {
      throw new ParametersException({
        msg: "搜索关键字不可为空"
      });
    }
    const { start, count } = paginate(ctx);
    const { logs, total } = await logDao.searchLogs(v, start, count, keyword);
    if (total < 1) {
      throw new NotFound({
        msg: "没有找到相关日志"
      });
    }
    ctx.json({
      total_nums: total,
      collection: logs
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
    const { start, count } = paginate(ctx);
    const arr = await logDao.getUserNames(start, count);
    ctx.json(arr);
  }
);
