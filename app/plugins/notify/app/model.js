"use strict";
const dayjs = require("dayjs");
const { db } = require("lin-mizar/lin/db");
const Sequelize = require("sequelize");

class Event extends Sequelize.Model {}

Event.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message_events: {
      type: Sequelize.STRING(250),
      allowNull: true
    }
  },
  {
    tableName: "notify_event",
    modelName: "event",
    createdAt: false,
    updatedAt: false,
    sequelize: db
  }
);

class Message extends Sequelize.Model {
  toJSON () {
    let origin = {
      id: this.id,
      message: this.message,
      event: this.event,
      time: this.time,
      pushed: this.pushed,
      readed: this.readed,
      user_id: this.userId,
      user_name: this.userName
    };
    return origin;
  }
}

Message.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: {
      type: Sequelize.STRING(600),
      allowNull: false
    },
    event: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    pushed: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
      comment: "0 表示未被推送； 1 表示已推送"
    },
    readed: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
      comment: "0 表示未读； 1 表示已读"
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_name: {
      type: Sequelize.STRING(50),
      allowNull: true
    }
  },
  {
    tableName: "notify_message",
    modelName: "message",
    createdAt: "time",
    updatedAt: false,
    sequelize: db,
    getterMethods: {
      time () {
        return dayjs(this.getDataValue("time")).unix();
      }
    }
  }
);

module.exports = { Message, Event };
