"use strict";

const { Log } = require("lin-mizar");
const { set } = require("lodash");
const { db } = require("lin-mizar/lin/db");
const Sequelize = require("sequelize");

class LogDao {
  async getLogs (v) {
    const start = v.get("query.page");
    const count1 = v.get("query.count");
    let condition = {};
    v.get("query.name") && set(condition, "user_name", v.get("query.name"));
    v.get("query.start") &&
      v.get("query.end") &&
      set(condition, "time", {
        [Sequelize.Op.between]: [v.get("query.start"), v.get("query.end")]
      });
    let { rows, count } = await Log.findAndCountAll({
      where: Object.assign({}, condition),
      offset: start * count1,
      limit: count1,
      order: [["time", "DESC"]]
    });
    return {
      rows,
      total: count
    };
  }

  async searchLogs (v, keyword) {
    const start = v.get("query.page");
    const count1 = v.get("query.count");
    let condition = {};
    v.get("query.name") && set(condition, "user_name", v.get("query.name"));
    v.get("query.start") &&
      v.get("query.end") &&
      set(condition, "time", {
        [Sequelize.Op.between]: [v.get("query.start"), v.get("query.end")]
      });
    let { rows, count } = await Log.findAndCountAll({
      where: Object.assign({}, condition, {
        message: {
          [Sequelize.Op.like]: `%${keyword}%`
        }
      }),
      offset: start * count1,
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
          start: start * count,
          count: count
        }
      }
    );
    const arr = Array.from(logs[0].map(it => it["names"]));
    return arr;
  }
}

module.exports = { LogDao };
