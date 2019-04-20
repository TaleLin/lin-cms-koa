/**
 *  扩展userModel的示例
 *  如果你的数据库中，已经存在了lin_user这张表
 *  你使用扩展userModel后，或许不会生效，请先在数据库删除原来的lin_user
 *  然后再运行程序
 */
"use strict";

const { modelExtend } = require("lin-mizar/lin/factory");
const { User } = require("lin-mizar");
const Sequelize = require("sequelize");

const User2 = modelExtend(User, {
  phone: {
    type: Sequelize.STRING(30),
    unique: true,
    allowNull: true
  }
});

User2.prototype.sayHello = function () {
  console.log("hello world!");
};

module.exports = { User2 };
