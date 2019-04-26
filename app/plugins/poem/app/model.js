"use strict";

const { InfoCrudMixin } = require("lin-mizar/lin/interface");
const { merge } = require("lodash");
const Sequelize = require("sequelize");
const { db } = require("lin-mizar/lin/db");

const { config } = require("lin-mizar/lin/config");

class Poem extends Sequelize.Model {
  static async search (q) {
    const poems = await Poem.findAll({
      where: {
        title: {
          [Sequelize.Op.like]: "%" + q + "%"
        }
      }
    });
    return poems;
  }

  static async getAll (validator) {
    const condition = {
      delete_time: null
    };
    validator.get("query.author") &&
      (condition["author"] = validator.get("query.author"));
    const poems = await Poem.findAll({
      where: {
        delete_time: null
      },
      limit: validator.get("query.count")
        ? validator.get("query.count")
        : config.getItem("poem.limit")
    });
    return poems;
  }

  static async getAuthors () {
    const authors = await db.query(
      "select author from poem group by author having count(author)>0"
    );
    let res = authors[0].map(it => it["author"]);
    return res;
  }

  toJSON () {
    let origin = {
      id: this.id,
      title: this.title,
      author: this.author,
      dynasty: this.dynasty,
      content: this.content,
      image: this.image,
      create_time: this.createTime
    };
    return origin;
  }
}

Poem.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: "标题"
    },
    author: {
      type: Sequelize.STRING(50),
      defaultValue: "未名",
      comment: "作者"
    },
    dynasty: {
      type: Sequelize.STRING(50),
      defaultValue: "未知",
      comment: "朝代"
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: "内容，以/来分割每一句，以|来分割宋词的上下片",
      get () {
        let raw = this.getDataValue("content");
        /**
         * @type Array
         */
        const lis = raw.split("|");
        const res = lis.map(x => x.split("/"));
        return res;
      }
    },
    image: {
      type: Sequelize.STRING(255),
      defaultValue: "",
      comment: "配图"
    }
  },
  merge(
    {
      tableName: "poem",
      modelName: "poem",
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Poem };
