"use strict";

const { InfoCrudMixin } = require("lin-mizar/lin/interface");
const { merge } = require("lodash");
const Sequelize = require("sequelize");
const { db } = require("lin-mizar/lin/db");

let Book = db.define(
  "book",
  merge(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      author: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: "未名"
      },
      summary: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      image: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    },
    InfoCrudMixin.attributes
  ),
  merge(
    {
      tableName: "book"
    },
    InfoCrudMixin.options
  )
);

Book.prototype.toJSON = function () {
  let origin = {
    id: this.id,
    title: this.title,
    author: this.author,
    summary: this.summary,
    image: this.image,
    create_time: this.createTime
  };
  return origin;
};

Book.prototype.softDelete = function () {
  this.delete_time = new Date();
  // 更新数据库
  this.save();
};

exports.Book = Book;
