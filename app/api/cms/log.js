"use strict";

const {
  LinRouter,
  groupRequired,
  NotFound,
  ParametersException,
  paginate,
  Log
} = require("lin-cms");
const { LogFindValidator } = require("../../validators/cms");
const { get, set } = require("lodash");
const { db } = require("lin-cms/lin/db");
const Sequelize = require("sequelize");

const log = new LinRouter({
  prefix: "/cms/log"
});

exports.log = log;

class LogDao {
  async getLogs (v, start, count1) {
    let condition = {};
    v.get("name") && set(condition, "user_name", v.get("name"));
    v.get("start") &&
      v.get("end") &&
      set(condition, "time", {
        [Sequelize.Op.between]: [v.get("start"), v.get("end")]
      });
    let { rows, count } = await Log.findAndCountAll({
      where: Object.assign({}, condition),
      offset: start,
      limit: count1,
      order: [["time", "DESC"]]
    });
    return {
      rows,
      total: count
    };
  }

  async searchLogs (v, start, count1, keyword) {
    let condition = {};
    v.get("name") && set(condition, "user_name", v.get("name"));
    v.get("start") &&
      v.get("end") &&
      set(condition, "time", {
        [Sequelize.Op.between]: [v.get("start"), v.get("end")]
      });
    let { rows, count } = await Log.findAndCount({
      where: Object.assign({}, condition, {
        message: {
          [Sequelize.Op.like]: `%${keyword}%`
        }
      }),
      offset: start,
      limit: count1,
      order: [["time", "DESC"]]
    });
    return {
      rows,
      total: count
    };
  }

  async getUserNames (start, count) {
    const logs = await db.query(
      "SELECT lin_log.user_name AS names FROM lin_log GROUP BY lin_log.user_name HAVING COUNT(lin_log.user_name)>0 limit :count offset :start",
      {
        replacements: {
          start: start,
          count: count
        }
      }
    );
    const arr = Array.from(logs[0].map(it => it["names"]));
    return arr;
  }
}

exports.LogDao = LogDao;

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
