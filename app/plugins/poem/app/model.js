"use strict";

const { InfoCrudMixin } = require("lin-mizar/lin/interface");
const { merge } = require("lodash");
const Sequelize = require("sequelize");
const { db } = require("lin-mizar/lin/db");

const { config } = require("lin-mizar/lin/config");

let Poem = db.define(
  "poem",
  merge(
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
    InfoCrudMixin.attributes
  ),
  merge(
    {
      tableName: "poem"
    },
    InfoCrudMixin.options
  )
);

Poem.prototype.toJSON = function () {
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
};

Poem.prototype.softDelete = function () {
  this.delete_time = new Date();
  // 更新数据库
  this.save();
};

Poem.getAll = async function (validator) {
  const condition = {
    delete_time: null
  };
  validator.get("author") && (condition["author"] = validator.get("author"));
  const poems = await Poem.findAll({
    where: {
      delete_time: null
    },
    limit: validator.get("author")
      ? validator.get("author")
      : config.getItem("poem.limit")
  });
  return poems;
};

Poem.search = async function (q) {
  const poems = await Poem.findAll({
    where: {
      title: {
        [Sequelize.Op.like]: "%" + q + "%"
      }
    }
  });
  return poems;
};

Poem.getAuthors = async function () {
  const authors = await db.query(
    "select author from poem group by author having count(author)>0"
  );
  let res = authors[0].map(it => it["author"]);
  return res;
};

exports.Poem = Poem;
