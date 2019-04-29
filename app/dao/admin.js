"use strict";
/* eslint-disable new-cap */
const {
  ParametersException,
  NotFound,
  UserAdmin,
  Forbidden,
  findMetaByAuth,
  unsets
} = require("lin-mizar");

const { has, set, get } = require("lodash");
const { db } = require("lin-mizar/lin/db");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

class AdminDao {
  async getUsers (ctx, groupId, start, count1) {
    let sql =
      "SELECT lin_user.*,lin_group.`name` as group_name FROM lin_user LEFT JOIN lin_group ON lin_user.group_id = lin_group.id WHERE";
    groupId && (sql += " lin_user.group_id = :id AND");
    let users = await db.query(
      sql +
        " lin_user.admin = :admin AND lin_user.delete_time IS NULL LIMIT :count OFFSET :start ",
      {
        replacements: groupId
          ? {
            id: groupId,
            admin: UserAdmin.COMMON,
            count: count1,
            start: start * count1
          }
          : {
            admin: UserAdmin.COMMON,
            count: count1,
            start: start * count1
          },
        type: db.QueryTypes.SELECT
      }
    );
    let total = await db.query(
      "SELECT COUNT(*) as count FROM lin_user WHERE lin_user.admin=:admin AND lin_user.delete_time IS NULL",
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

  async changeUserPassword (ctx, v) {
    const id = v.get("path.id");
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
    user.resetPassword(v.get("body.new_password"));
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
    user.destroy();
  }

  async updateUserInfo (ctx, v) {
    const id = v.get("path.id");
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
    if (user.email !== v.get("body.email")) {
      const exit = await ctx.manager.userModel.findOne({
        where: {
          email: v.get("body.email"),
          delete_time: null
        }
      });
      if (exit) {
        throw new ParametersException({
          msg: "邮箱已被注册，请重新输入邮箱"
        });
      }
    }
    user.group_id = v.get("body.group_id");
    user.email = v.get("body.email");
    user.save();
  }

  async getGroups (ctx, start, count1) {
    const groups = await db.query(
      "SELECT lin_group.* FROM lin_group LIMIT :count OFFSET :start",
      {
        replacements: {
          count: count1,
          start: start * count1
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
    const group = await ctx.manager.groupModel.findByPk(id);
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
        name: v.get("body.name")
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
          name: v.get("body.name"),
          info: v.get("body.info")
        },
        {
          transaction
        }
      );
      for (const item of v.get("body.auths")) {
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

  async updateGroup (ctx, v) {
    const id = v.get("path.id");
    const exit = await ctx.manager.groupModel.findByPk(id);
    if (!exit) {
      throw new NotFound({
        msg: "分组不存在，更新失败"
      });
    }
    exit.name = v.get("body.name");
    exit.info = v.get("body.info");
    exit.save();
  }

  async deleteGroup (ctx, id) {
    const exit = await ctx.manager.groupModel.findByPk(id);
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
    const group = await ctx.manager.groupModel.findByPk(v.get("body.group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    const one = await ctx.manager.authModel.findOne({
      where: {
        group_id: v.get("body.group_id"),
        auth: v.get("body.auth")
      }
    });
    if (one) {
      throw new Forbidden({
        msg: "已有权限，不可重复添加"
      });
    }
    const au = new ctx.manager.authModel();
    const { auth, module } = findMetaByAuth(v.get("body.auth"));
    au.auth = auth;
    au.module = module;
    au.group_id = v.get("body.group_id");
    await au.save();
  }

  async dispatchAuths (ctx, v) {
    const group = await ctx.manager.groupModel.findByPk(v.get("body.group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    v.get("body.auths").forEach(async item => {
      const one = await ctx.manager.authModel.findOne({
        where: {
          group_id: v.get("body.group_id"),
          auth: item
        }
      });
      if (!one) {
        const au = new ctx.manager.authModel();
        const { auth, module } = findMetaByAuth(item);
        au.auth = auth;
        au.module = module;
        au.group_id = v.get("body.group_id");
        await au.save();
      }
    });
  }

  async removeAuths (ctx, v) {
    const group = await ctx.manager.groupModel.findByPk(v.get("body.group_id"));
    if (!group) {
      throw new NotFound({
        msg: "分组不存在"
      });
    }
    await ctx.manager.authModel.destroy({
      where: {
        group_id: v.get("body.group_id"),
        auth: {
          [Op.in]: v.get("body.auths")
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

module.exports = { AdminDao };
