/* eslint-disable new-cap */
"use strict";

const {
  Redprint,
  getTokens,
  loginRequired,
  Success,
  refreshTokenRequired,
  Failed,
  jwt,
  RepeatException,
  ParametersException
} = require("lin-cms");

const {
  RegisterValidator,
  LoginValidator,
  UpdateInfoValidator,
  ChangePasswordValidator
} = require("../../validators/cms");

const { set, has } = require("lodash");

class UserDao {
  async createUser (ctx, v) {
    let user = await ctx.manager.userModel.findOne({
      where: {
        nickname: v.get("nickname")
      }
    });
    if (user) {
      throw new RepeatException({
        msg: "用户名重复，请重新输入"
      });
    }
    if (v.get("email") && v.get("email").trim() !== "") {
      user = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("email")
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
    if (user.email !== v.get("email")) {
      const exit = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("email")
        }
      });
      if (exit) {
        throw new ParametersException({
          msg: "邮箱已被注册，请重新输入邮箱"
        });
      }
    }
    user.email = v.get("email");
    user.save();
  }

  async getAuths (ctx) {
    let user = ctx.currentUser;
    let auths = await ctx.manager.authModel.findAll({
      group_id: user.group_id
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
    user.nickname = v.get("nickname");
    user.password = v.get("password");
    user.group_id = v.get("group_id");
    if (v.get("email") && v.get("email").trim() !== "") {
      user.email = v.get("email");
    }
    user.save();
  }
}

const user = new Redprint({
  prefix: "/cms/user"
});

exports.user = user;

exports.UserDao = UserDao;

const userDao = new UserDao();

user.redPost(
  "userRegister",
  "/register",
  {
    auth: "注册",
    module: "用户",
    mount: false
  },
  async ctx => {
    const v = await new RegisterValidator().validate(ctx);
    await userDao.createUser(ctx, v);
    ctx.json(
      new Success({
        msg: "用户创建成功"
      })
    );
  }
);

user.redPost(
  "userLogin",
  "/login",
  {
    auth: "登陆",
    module: "用户",
    mount: false
  },
  async ctx => {
    const v = await new LoginValidator().validate(ctx);
    let user = await ctx.manager.userModel.verify(
      v.get("nickname"),
      v.get("password")
    );
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
);

user.redPut(
  "userUpdate",
  "/",
  {
    auth: "用户更新信息",
    module: "用户",
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new UpdateInfoValidator().validate(ctx);
    await userDao.updateUser(ctx, v);
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
  }
);

user.redPut(
  "userUpdatePassword",
  "/change_password",
  {
    auth: "修改密码",
    module: "用户",
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new ChangePasswordValidator().validate(ctx);
    let user = ctx.currentUser;
    const ok = user.changePassword(
      v.get("old_password"),
      v.get("new_password")
    );
    if (ok) {
      user.save();
      ctx.json(
        new Success({
          msg: "密码修改成功"
        })
      );
    } else {
      ctx.json(
        new Failed({
          msg: "修改密码失败"
        })
      );
    }
  }
);

user.redGet(
  "userGetToken",
  "/refresh",
  {
    auth: "刷新令牌",
    module: "用户",
    mount: false
  },
  refreshTokenRequired,
  async ctx => {
    let user = ctx.currentUser;
    const accessToken = jwt.createAccessToken(user.id);
    ctx.json({
      access_token: accessToken
    });
  }
);

user.redGet(
  "userGetAuths",
  "/auths",
  {
    auth: "查询自己拥有的权限",
    module: "用户",
    mount: false
  },
  loginRequired,
  async ctx => {
    let user = await userDao.getAuths(ctx);
    ctx.json(user);
  }
);
