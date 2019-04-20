/* eslint-disable new-cap */
"use strict";

const { RepeatException, ParametersException } = require("lin-mizar");
const { set, has } = require("lodash");

class UserDao {
  async createUser (ctx, v) {
    let user = await ctx.manager.userModel.findOne({
      where: {
        nickname: v.get("body.nickname")
      }
    });
    if (user) {
      throw new RepeatException({
        msg: "用户名重复，请重新输入"
      });
    }
    if (v.get("body.email") && v.get("body.email").trim() !== "") {
      user = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("body.email")
        }
      });
      if (user) {
        throw new RepeatException({
          msg: "注册邮箱重复，请重新输入"
        });
      }
    }
    this.registerUser(ctx, v);
  }

  async updateUser (ctx, v) {
    let user = ctx.currentUser;
    if (user.email !== v.get("body.email")) {
      const exit = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("body.email")
        }
      });
      if (exit) {
        throw new ParametersException({
          msg: "邮箱已被注册，请重新输入邮箱"
        });
      }
    }
    user.email = v.get("body.email");
    user.save();
  }

  async getAuths (ctx) {
    let user = ctx.currentUser;
    let auths = await ctx.manager.authModel.findAll({
      where: {
        group_id: user.group_id
      }
    });
    const aus = this.splitAuths(auths);
    set(user, "auths", aus);
    return user;
  }

  splitAuths (auths) {
    let tmp = {};
    auths.forEach(au => {
      if (!has(tmp, au["module"])) {
        tmp[au["module"]] = [
          {
            module: au["module"],
            auth: au["auth"]
          }
        ];
      } else {
        tmp[au["module"]].push({
          module: au["module"],
          auth: au["auth"]
        });
      }
    });
    const aus = Object.keys(tmp).map(key => {
      let tm1 = Object.create(null);
      set(tm1, key, tmp[key]);
      return tm1;
    });
    return aus;
  }

  registerUser (ctx, v) {
    const user = new ctx.manager.userModel();
    user.nickname = v.get("body.nickname");
    user.password = v.get("body.password");
    user.group_id = v.get("body.group_id");
    if (v.get("body.email") && v.get("body.email").trim() !== "") {
      user.email = v.get("body.email");
    }
    user.save();
  }
}

module.exports = { UserDao };
