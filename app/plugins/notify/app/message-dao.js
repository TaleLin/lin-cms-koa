"use strict";

const { NotFound, Forbidden } = require("lin-mizar");
const { get } = require("lodash");
const { Message } = require("./model");
const { MessageIsReaded } = require("./enums");
const Sequelize = require("sequelize");

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
      offset: start * count1
    });
    return {
      rows,
      count
    };
  }

  async readMessage (id) {
    const msg = await Message.findByPk(id);
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
          [Sequelize.Op.in]: v.get("body.ids")
        }
      }
    );
  }

  async deleteMessage (id) {
    const msg = await Message.findByPk(id);
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

module.exports = { MessageDao };
