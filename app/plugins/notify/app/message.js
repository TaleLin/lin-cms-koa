"use strict";

const {
  LinRouter,
  loginRequired,
  NotFound,
  paginate,
  Success,
  Forbidden
} = require("lin-mizar");
const { getSafeParamId } = require("../../../libs/util");
const { IdsValidator } = require("./validators");
const { get } = require("lodash");
const { Message } = require("./model");
const { MessageIsReaded } = require("./enums");
const Sequelize = require("sequelize");

const messageApi = new LinRouter({
  prefix: "/message"
});
exports.messageApi = messageApi;

class MessageDao {
  async getMessages (ctx, start, count1) {
    const currentUser = ctx.currentUser;
    let condition = {};
    const readed = get(ctx.query, "readed");
    readed && (condition["readed"] = readed);
    const pushed = get(ctx.query, "pushed");
    pushed && (condition["pushed"] = pushed);

    const { rows, count } = await Message.findAndCountAll({
      where: {
        ...condition,
        user_id: currentUser.id
      },
      limit: count1,
      offset: start
    });
    return {
      rows,
      count
    };
  }

  async readMessage (id) {
    const msg = await Message.findById(id);
    if (!msg) {
      throw new NotFound({
        msg: "未找到消息"
      });
    }
    if (msg.readed === MessageIsReaded.READED) {
      throw new Forbidden({
        msg: "不可重复设置为已读"
      });
    }
    msg.readed = MessageIsReaded.READED;
    msg.save();
  }

  async readMessages (v) {
    await Message.update(
      {
        readed: MessageIsReaded.READED
      },
      {
        where: {
          [Sequelize.Op.in]: v.get("ids")
        }
      }
    );
  }

  async deleteMessage (id) {
    const msg = await Message.findById(id);
    if (!msg) {
      throw new NotFound({
        msg: "未找到消息"
      });
    }
    await Message.destroy({
      where: {
        id: id
      }
    });
  }
}

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
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
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
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
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
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
  }
);

messageApi.get("/test", async ctx => {
  ctx.json({
    msg: "hello baby!"
  });
});
