"use strict";

const { LinRouter, loginRequired, NotFound, paginate } = require("lin-mizar");
const { getSafeParamId } = require("../../../libs/util");
const { IdsValidator } = require("./validators");
const { MessageDao } = require("./message-dao");

const messageApi = new LinRouter({
  prefix: "/message"
});

const messageDao = new MessageDao();

messageApi.linGet(
  "getMessages",
  "/",
  {
    auth: "获得推送的消息",
    module: "推送",
    mount: false
  },
  loginRequired,
  async ctx => {
    const { start, count } = paginate(ctx);
    const { messages, total } = await messageDao.getMessages(ctx, start, count);
    if (total < 1) {
      throw new NotFound({
        msg: "未找到任何消息"
      });
    }
    ctx.json({
      collection: messages,
      total_nums: total
    });
  }
);

messageApi.linPut(
  "readMessage",
  "/one/:id",
  {
    auth: "标记一条消息为已读",
    module: "推送",
    mount: false
  },
  loginRequired,
  async ctx => {
    const id = getSafeParamId(ctx);
    await messageDao.readMessage(id);
    ctx.success({
      msg: "操作成功"
    });
  }
);

messageApi.linPut(
  "readMessages",
  "/some",
  {
    auth: "标记多条消息为已读",
    module: "推送",
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new IdsValidator().validate(ctx);
    await messageDao.readMessages(v);
    ctx.success({
      msg: "操作成功"
    });
  }
);

messageApi.linDelete(
  "deleteMessage",
  "/:id",
  {
    auth: "删除一条消息",
    module: "推送",
    mount: false
  },
  loginRequired,
  async ctx => {
    const id = getSafeParamId(ctx);
    await messageDao.deleteMessage(id);
    ctx.success({
      msg: "操作成功"
    });
  }
);

messageApi.get("/test", async ctx => {
  ctx.json({
    msg: "hello baby!"
  });
});

module.exports = { messageApi };
