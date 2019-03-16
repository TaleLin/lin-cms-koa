"use strict";

const Sequelize = require("sequelize");
const { db } = require("lin-cms/lin/db");

let Image = db.define("image", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  from: {
    type: Sequelize.SMALLINT,
    defaultValue: 1,
    comment: "1 表示来自oss，2 表示来自本地"
  },
  url: {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: "图片url"
  }
});

exports.Image = Image;
