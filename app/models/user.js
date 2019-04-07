"use strict";

const { modelExtend } = require("lin-mizar/lin/factory");
const { User } = require("lin-mizar");
const Sequelize = require("sequelize");

const User2 = modelExtend(User, {
  phone: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  }
});

User2.prototype.sayHello = function () {
  console.log("hello world!");
};

exports.User2 = User2;
