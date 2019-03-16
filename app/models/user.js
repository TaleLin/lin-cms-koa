const { modelExtend } = require("lin-cms/lin/factory");
const { User } = require("lin-cms");
const Sequelize = require("sequelize");

// User.tableAttributes = {
//   ...User.tableAttributes,
//   phone: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: true
//   }
// };

// const User2 = class extends User {};

// User2.prototype.sayHello = function() {
//   console.log('hello world!');
// };

// Object.defineProperty(User2.prototype, 'phone', {
//   get() {
//     return this.dataValues && this.dataValues.phone;
//   }
// });

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
