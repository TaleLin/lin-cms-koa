const { modelExtend } = require("lin-cms/lin/factory");
const { User } = require("lin-cms");
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
