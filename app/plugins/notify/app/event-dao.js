"use strict";

const { NotFound, Forbidden } = require("lin-mizar");
const { Event } = require("./model");

class EventDao {
  async getEvents (groupId) {
    const event = await Event.findOne({
      where: {
        group_id: groupId
      }
    });
    if (!event) {
      throw new NotFound({
        msg: "当前用户没有推送项"
      });
    }
    return event.message_events.split(",");
  }

  async createEvents (v) {
    const event = await Event.findOne({
      where: {
        group_id: v.get("body.group_id")
      }
    });
    if (event) {
      throw new Forbidden({
        msg: "当前权限组已存在推送项"
      });
    }
    const ev = new Event();
    ev.group_id = v.get("body.group_id");
    ev.message_events = v.get("body.events").join(",");
    ev.save();
  }

  async updateEvents (v) {
    const event = await Event.findOne({
      where: {
        group_id: v.get("body.group_id")
      }
    });
    if (!event) {
      throw new NotFound({
        msg: "当前权限组不存在推送项"
      });
    }
    event.message_events = v.get("body.events").join(",");
    event.save();
  }
}

module.exports = { EventDao };
