"use strict";

const { Log } = require("lin-mizar");
const { set } = require("lodash");
const { db } = require("lin-mizar/lin/db");
const Sequelize = require("sequelize");

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
