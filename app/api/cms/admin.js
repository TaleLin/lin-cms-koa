/* eslint-disable new-cap */
"use strict";

const {
  LinRouter,
  paginate,
  routeMetaInfo,
  adminRequired,
  Success,
  ParametersException,
  NotFound,
  Failed,
  UserAdmin,
  Forbidden,
  findMetaByAuth,
  unsets
} = require("lin-cms");

const { has, set, get, toSafeInteger, isInteger } = require("lodash");
const {
  ResetPasswordValidator,
  UpdateUserInfoValidator,
  NewGroupValidator,
  UpdateGroupValidator,
  DispatchAuthValidator,
  DispatchAuthsValidator,
  RemoveAuthsValidator
} = require("../../validators/cms");
const { getSafeParamId } = require("../../libs/util");
const { db } = require("lin-cms/lin/db");
const dayjs = require("dayjs");

const admin = new LinRouter({
  prefix: "/cms/admin"
});

exports.admin = admin;

class AdminDao {
  async getUsers (ctx, groupId, start, count1) {
    let sql =
      "SELECT lin_user.*,lin_group.`name` as group_name FROM lin_user LEFT JOIN lin_group ON lin_user.group_id = lin_group.id WHERE";
    groupId && (sql += " lin_user.group_id = :id AND");
    let users = await db.query(
      sql + " lin_user.admin = :admin LIMIT :count OFFSET :start ",
      {
        replacements: groupId
          ? {
            id: groupId,
            admin: UserAdmin.COMMON,
            count: count1,
            start: start
          }
          : {
            admin: UserAdmin.COMMON,
            count: count1,
            start: start
          },
        type: db.QueryTypes.SELECT
      }
    );
    let total = await db.query(
      "SELECT COUNT(*) as count FROM lin_user WHERE lin_user.admin=:admin",
      {
        replacements: {
          admin: UserAdmin.COMMON
        },
        type: db.QueryTypes.SELECT
      }
    );
    users.map(user => {
      unsets(user, ["update_time", "delete_time", "password"]);
      user.create_time = dayjs(user.create_time).unix();
      return user;
    });
    total = total[0]["count"];
    return {
      users,
      total
    };
  }

  async changeUserPassword (ctx, v, id) {
    const user = await ctx.manager.userModel.findOne({
      where: {
        id: id,
        delete_time: null
      }
    });
    if (!user) {
      throw new NotFound({
        msg: "用户不存在"
      });
    }
    user.resetPassword(v.get("new_password"));
    user.save();
  }

  async deleteUser (ctx, id) {
    const user = await ctx.manager.userModel.findOne({
      where: {
        id: id,
        delete_time: null
      }
    });
    if (!user) {
      throw new NotFound({
        msg: "用户不存在"
      });
    }
    // 推荐调用软删除，即下面注释代码
    user.softDelete();
  }

  async updateUserInfo (ctx, v, id) {
    const user = await ctx.manager.userModel.findOne({
      where: {
        id: id,
        delete_time: null
      }
    });
    if (!user) {
      throw new NotFound({
        msg: "用户不存在"
      });
    }
    if (user.email !== v.get("email")) {
      const exit = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("email"),
          delete_time: null
        }
      });
      if (exit) {
        throw new ParametersException({
          msg: "邮箱已被注册，请重新输入邮箱"
        });
      }
    }
    user.group_id = v.get("group_id");
    user.email = v.get("email");
    user.save();
  }

  async getGroups (ctx, start, count1) {
    const groups = await db.query(
      "SELECT lin_group.* FROM lin_group LIMIT :count OFFSET :start",
      {
        replacements: {
          count: count1,
          start: start
        },
        type: db.QueryTypes.SELECT
      }
    );
    groups.forEach(async group => {
      const auths = await db.query(
        "SELECT lin_auth.auth,lin_auth.module FROM lin_auth WHERE lin_auth.group_id=:id",
        {
          replacements: {
            id: group.id
          },
          type: db.QueryTypes.SELECT
        }
      );
      set(group, "auths", auths);
      this.formatAuths(group);
    });
    let total = await db.query("SELECT COUNT(*) as count FROM lin_group", {
      type: db.QueryTypes.SELECT
    });
    total = total[0]["count"];
    return {
      groups,
      total
    };
  }

  async getGroup (ctx, id) {
    const group = await ctx.manager.groupModel.findById(id);
    const auths = await db.query(
      "SELECT lin_auth.auth,lin_auth.module FROM lin_auth WHERE lin_auth.group_id=:id",
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    set(group, "auths", auths);
    this.formatAuths(group);
    return group;
  }

  async createGroup (ctx, v) {
    const exit = await ctx.manager.groupModel.findOne({
      where: {
        name: v.get("name")
      }
    });
    if (exit) {
      throw new Forbidden({
        msg: "分组已存在，不可创建同名分组"
      });
    }
    let transaction;
    try {
      transaction = await db.transaction();
      const group = await ctx.manager.groupModel.create(
        {
          name: v.get("name"),
          info: v.get("info")
        },
        {
          transaction
        }
      );
      for (const item of v.get("auths")) {
        const { auth, module } = findMetaByAuth(item);
        await ctx.manager.authModel.create(
          {
            auth,
            module,
            group_id: group.id
          },
          {
            transaction
          }
        );
      }
      await transaction.commit();
    } catch (err) {
      if (transaction) await transaction.rollback();
    }
    return true;
  }

  async updateGroup (ctx, v, id) {
    const exit = await ctx.manager.groupModel.findById(id);
    if (!exit) {
      throw new NotFound({
        msg: "分组不存在，更新失败"
      });
    }
    exit.name = v.get("name");
    exit.info = v.get("info");
    exit.save();
  }

  async deleteGroup (ctx, id) {
    const exit = await ctx.manager.groupModel.findById(id);
    if (!exit) {
      throw new NotFound({
        msg: "分组不存在，删除失败"
      });
    }
    const user = await ctx.manager.userModel.findOne({
      where: {
        group_id: id
      }
    });
    if (user) {
      throw new Forbidden({
        msg: "分组下存在用户，不可删除"
      });
    }
    let transaction;
    try {
      transaction = await db.transaction();
      await exit.destroy({
        transaction
      });
      await ctx.manager.authModel.destroy({
        where: {
          group_id: id
        },
        transaction
      });
      await transaction.commit();
    } catch (err) {
      if (transaction) await transaction.rollback();
    }
  }

  async dispatchAuth (ctx, v) {
    const group = await ctx.manager.groupModel.findById(v.get("group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    const one = await ctx.manager.authModel.findOne({
      where: {
        group_id: v.get("group_id"),
        auth: v.get("auth")
      }
    });
    if (one) {
      throw new Forbidden({
        msg: "已有权限，不可重复添加"
      });
    }
    const au = new ctx.manager.authModel();
    const { auth, module } = findMetaByAuth(v.get("auth"));
    au.auth = auth;
    au.module = module;
    au.group_id = v.get("group_id");
    await au.save();
  }

  async dispatchAuths (ctx, v) {
    const group = await ctx.manager.groupModel.findById(v.get("group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    v.get("auths").forEach(async item => {
      const one = await ctx.manager.authModel.findOne({
        where: {
          group_id: v.get("group_id"),
          auth: item
        }
      });
      if (!one) {
        const au = new ctx.manager.authModel();
        const { auth, module } = findMetaByAuth(item);
        au.auth = auth;
        au.module = module;
        au.group_id = v.get("group_id");
        await au.save();
      }
    });
  }

  async removeAuths (ctx, v) {
    const group = await ctx.manager.groupModel.findById(v.get("group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    await ctx.manager.authModel.destroy({
      where: {
        group_id: v.get("group_id"),
        auth: {
          [db.Op.in]: v.get("auths")
        }
      }
    });
  }

  formatAuths (group) {
    if (has(group, "auths")) {
      const aus = get(group, "auths");
      let tmp = {};
      aus.forEach(au => {
        if (!has(tmp, au["module"])) {
          tmp[au["module"]] = [
            {
              auth: au["auth"],
              module: au["module"]
            }
          ];
        } else {
          tmp[au["module"]].push({
            auth: au["auth"],
            module: au["module"]
          });
        }
      });
      const aus1 = Object.keys(tmp).map(key => {
        let tm1 = Object.create(null);
        set(tm1, key, tmp[key]);
        return tm1;
      });
      set(group, "auths", aus1);
    }
  }
}

exports.AdminDao = AdminDao;

const adminDao = new AdminDao();

admin.linGet(
  "getAuthority",
  "/authority",
  {
    auth: "查询所有可分配的权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  ctx => {
    const res = {};
    routeMetaInfo.forEach((v, k) => {
      const au = v["auth"];
      if (!has(res, `${v["module"]}.${au}`)) {
        set(res, `${v["module"]}.${au}`, [k]);
      } else {
        res[v["module"]][au].push(k);
      }
    });
    ctx.json(res);
  }
);

admin.linGet(
  "getAdminUsers",
  "/users",
  {
    auth: "查询所有用户",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const groupId = get(ctx.request.query, "group_id");
    const { start, count } = paginate(ctx);
    const { users, total } = await adminDao.getUsers(
      ctx,
      groupId,
      start,
      count
    );
    ctx.json({
      collection: users,
      // 超级管理员不算入总数
      total_nums: total
    });
  }
);

admin.linPut(
  "changeUserPassword",
  "/password/:id",
  {
    auth: "修改用户密码",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new ResetPasswordValidator().validate(ctx);
    const id = toSafeInteger(get(ctx.params, "id"));
    if (!isInteger(id)) {
      throw new ParametersException({
        msg: "路由参数错误"
      });
    }
    await adminDao.changeUserPassword(ctx, v, id);
    ctx.json(
      new Success({
        msg: "密码修改成功"
      })
    );
  }
);

admin.linDelete(
  "deleteUser",
  "/:id",
  {
    auth: "删除用户",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const id = toSafeInteger(get(ctx.params, "id"));
    if (!isInteger(id)) {
      throw new ParametersException({
        msg: "路由参数错误"
      });
    }
    await adminDao.deleteUser(ctx, id);
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
  }
);

admin.linPut(
  "updateUser",
  "/:id",
  {
    auth: "管理员更新用户信息",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new UpdateUserInfoValidator().validate(ctx);
    const id = toSafeInteger(get(ctx.params, "id"));
    if (!isInteger(id)) {
      throw new ParametersException({
        msg: "路由参数错误"
      });
    }
    await adminDao.updateUserInfo(ctx, v, id);
    ctx.json(
      new Success({
        msg: "操作成功"
      })
    );
  }
);

admin.linGet(
  "getAdminGroups",
  "/groups",
  {
    auth: "查询所有权限组及其权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const { start, count } = paginate(ctx);
    const { groups, total } = await adminDao.getGroups(ctx, start, count);
    if (total < 1) {
      throw new NotFound({
        msg: "未找到任何权限组"
      });
    }
    ctx.json({
      collection: groups,
      total_nums: total
    });
  }
);

admin.linGet(
  "getAllGroup",
  "/group/all",
  {
    auth: "查询所有权限组",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const groups = await ctx.manager.groupModel.findAll();
    if (!groups || groups.length < 1) {
      throw new NotFound({
        msg: "未找到任何权限组"
      });
    }
    ctx.json(groups);
  }
);

admin.linGet(
  "getGroup",
  "/group/:id",
  {
    auth: "查询一个权限组及其权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const id = toSafeInteger(get(ctx.params, "id"));
    if (!isInteger(id)) {
      throw new ParametersException({
        msg: "路由参数错误"
      });
    }
    const group = await adminDao.getGroup(ctx, id);
    ctx.json(group);
  }
);

admin.linPost(
  "createGroup",
  "/group",
  {
    auth: "新建权限组",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new NewGroupValidator().validate(ctx);
    const ok = await adminDao.createGroup(ctx, v);
    if (!ok) {
      ctx.json(
        new Failed({
          msg: "新建分组失败"
        })
      );
    } else {
      ctx.json(
        new Success({
          msg: "新建分组成功"
        })
      );
    }
  }
);

admin.linPut(
  "updateGroup",
  "/group/:id",
  {
    auth: "更新一个权限组",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new UpdateGroupValidator().validate(ctx);
    const id = getSafeParamId(ctx);
    await adminDao.updateGroup(ctx, v, id);
    ctx.json(
      new Success({
        msg: "更新分组成功"
      })
    );
  }
);

admin.linDelete(
  "deleteGroup",
  "/group/:id",
  {
    auth: "删除一个权限组",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const id = getSafeParamId(ctx);
    await adminDao.deleteGroup(ctx, id);
    ctx.json(
      new Success({
        msg: "删除分组成功"
      })
    );
  }
);

admin.linPost(
  "dispatchAuth",
  "/dispatch",
  {
    auth: "分配单个权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new DispatchAuthValidator().validate(ctx);
    await adminDao.dispatchAuth(ctx, v);
    ctx.json(
      new Success({
        msg: "添加权限成功"
      })
    );
  }
);

admin.linPost(
  "dispatchAuths",
  "/dispatch/patch",
  {
    auth: "分配多个权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new DispatchAuthsValidator().validate(ctx);
    await adminDao.dispatchAuths(ctx, v);
    ctx.json(
      new Success({
        msg: "添加权限成功"
      })
    );
  }
);

admin.linPost(
  "removeAuths",
  "/remove",
  {
    auth: "删除多个权限",
    module: "管理员",
    mount: false
  },
  adminRequired,
  async ctx => {
    const v = await new RemoveAuthsValidator().validate(ctx);
    await adminDao.removeAuths(ctx, v);
    ctx.json(
      new Success({
        msg: "删除权限成功"
      })
    );
  }
);
