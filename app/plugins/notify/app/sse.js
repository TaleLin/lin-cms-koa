"use strict";

const { LinRouter, groupRequired, adminRequired } = require("lin-mizar");
const { SSE } = require("lin-mizar/lin/sse");
const dayjs = require("dayjs");
const { EventsValidator } = require("./validators");
const { broker, notify, MESSAGE_EVENTS } = require("./middleware");
const { EventDao } = require("./event-dao");

const sseApi = new LinRouter({
  prefix: "/sse"
});

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
    ctx.success({
      msg: "创建成功"
    });
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
    ctx.success({
      msg: "更新成功"
    });
  }
);

module.exports = { sseApi };
