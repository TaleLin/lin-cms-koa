"use strict";

const {
  LinRouter,
  routeMetaInfo,
  adminRequired,
  NotFound,
  Failed
} = require("lin-mizar");

const { has, set } = require("lodash");

const {
  DispatchAuthsValidator,
  RemoveAuthsValidator,
  UpdateGroupValidator,
  ResetPasswordValidator,
  AdminUsersValidator,
  UpdateUserInfoValidator,
  NewGroupValidator,
  DispatchAuthValidator
} = require("../../validators/admin");

const {
  PositiveIdValidator,
  PaginateValidator
} = require("../../validators/common");

const { AdminDao } = require("../../dao/admin");

const admin = new LinRouter({
  prefix: "/cms/admin"
});

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
    const v = await new AdminUsersValidator().validate(ctx);
    const { users, total } = await adminDao.getUsers(
      ctx,
      v.get("query.group_id"),
      v.get("query.page"),
      v.get("query.count")
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
    await adminDao.changeUserPassword(ctx, v);
    ctx.success({
      msg: "密码修改成功"
    });
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
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get("path.id");
    await adminDao.deleteUser(ctx, id);
    ctx.success({
      msg: "操作成功"
    });
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
    await adminDao.updateUserInfo(ctx, v);
    ctx.success({
      msg: "操作成功"
    });
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
    const v = await new PaginateValidator().validate(ctx);
    const { groups, total } = await adminDao.getGroups(
      ctx,
      v.get("query.page"),
      v.get("query.count")
    );
    if (groups.length < 1) {
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
    const v = await new PositiveIdValidator().validate(ctx);
    const group = await adminDao.getGroup(ctx, v.get("path.id"));
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
      throw new Failed({
        msg: "新建分组失败"
      });
    }
    ctx.success({
      msg: "新建分组成功"
    });
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
    await adminDao.updateGroup(ctx, v);
    ctx.success({
      msg: "更新分组成功"
    });
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
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get("path.id");
    await adminDao.deleteGroup(ctx, id);
    ctx.success({
      msg: "删除分组成功"
    });
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
    ctx.success({
      msg: "添加权限成功"
    });
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
    ctx.success({
      msg: "添加权限成功"
    });
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
    ctx.success({
      msg: "删除权限成功"
    });
  }
);

module.exports = { admin };
