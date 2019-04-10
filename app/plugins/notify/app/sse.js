"use strict";

const {
  LinRouter,
  groupRequired,
  adminRequired,
  Success,
  NotFound,
  Forbidden
} = require("lin-mizar");
const { SSE } = require("lin-mizar/lin/sse");
const dayjs = require("dayjs");
const { EventsValidator } = require("./validators");
const { broker, notify, MESSAGE_EVENTS } = require("./middleware");
const { Event } = require("./model");

const sseApi = new LinRouter({
  prefix: "/sse"
});
exports.sseApi = sseApi;

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

const eventDao = new EventDao();

sseApi.linGet(
  "stream",
  "/",
  {
    auth: "消息推送",
    module: "推送",
    mount: true
  },
  groupRequired,
  async ctx => {
    ctx.req.setTimeout(Number.MAX_VALUE, () => {});
    ctx.type = "text/event-stream; charset=utf-8";
    ctx.set("Cache-Control", "no-cache");
    ctx.set("Connection", "keep-alive");
    const body = (ctx.body = new SSE());
    let interval = setInterval(() => {
      if (broker.exitMessage()) {
        body.write(broker.pop());
      } else {
        body.write(broker.heartbeat());
      }
    }, 2000);
    body.on("close", (...args) => {
      clearInterval(interval);
    });
    const socket = ctx.socket;
    socket.on("error", close);
    socket.on("close", close);

    function close () {
      socket.removeListener("error", close);
      socket.removeListener("close", close);
    }
  }
);

sseApi.get("/test", async ctx => {
  // 不想记录到数据库，只想单纯的推送
  broker.addMessage("test", {
    message: "就是想测试一下你是否是一个瓜皮",
    time: dayjs(new Date()).unix()
  });
  ctx.json({
    msg: "添加消息成功！"
  });
});

sseApi.linGet(
  "getEvents",
  "/events",
  {
    auth: "获得events",
    module: "推送",
    mount: true
  },
  groupRequired,
  notify("测试一条消息", "test"),
  async ctx => {
    const currentUser = ctx.currentUser;
    if (currentUser.isAdmin) {
      ctx.json({
        events: Array.from(MESSAGE_EVENTS.values())
      });
      return;
    }
    const events = await eventDao.getEvents(currentUser.groupId);
    ctx.json({
      events
    });
  }
);

sseApi.linPost(
  "createEvents",
  "/events",
  {
    auth: "创建events",
    module: "推送",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new EventsValidator().validate(ctx);
    await eventDao.createEvents(v);
    ctx.json(
      new Success({
        msg: "创建成功"
      })
    );
  }
);

sseApi.linPut(
  "putEvents",
  "/events",
  {
    auth: "更新events",
    module: "推送",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new EventsValidator().validate(ctx);
    await eventDao.updateEvents(v);
    ctx.json(
      new Success({
        msg: "更新成功"
      })
    );
  }
);
