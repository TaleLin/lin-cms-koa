import { LinRouter, Failed, NotFound } from 'lin-mizar';
import {
  AdminUsersValidator,
  ResetPasswordValidator,
  UpdateUserInfoValidator,
  NewGroupValidator,
  UpdateGroupValidator,
  DispatchPermissionValidator,
  DispatchPermissionsValidator,
  RemovePermissionsValidator
} from '../../validator/admin';
import { PositiveIdValidator, PaginateValidator } from '../../validator/common';

import { adminRequired } from '../../middleware/jwt';
import { AdminDao } from '../../dao/admin';

const admin = new LinRouter({
  prefix: '/cms/admin',
  module: '管理员',
  // 管理员权限暂不支持分配，开启分配后也无实际作用
  mountPermission: false
});

const adminDao = new AdminDao();

admin.linGet(
  'getAllPermissions',
  '/permission',
  admin.permission('查询所有可分配的权限'),
  adminRequired,
  async ctx => {
    const permissions = await adminDao.getAllPermissions();
    ctx.json(permissions);
  }
);

admin.linGet(
  'getAdminUsers',
  '/users',
  admin.permission('查询所有用户'),
  adminRequired,
  async ctx => {
    const v = await new AdminUsersValidator().validate(ctx);
    const { users, total } = await adminDao.getUsers(
      v.get('query.group_id'),
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      items: users,
      total,
      count: v.get('query.count'),
      page: v.get('query.page')
    });
  }
);

admin.linPut(
  'changeUserPassword',
  '/user/:id/password',
  admin.permission('修改用户密码'),
  adminRequired,
  async ctx => {
    const v = await new ResetPasswordValidator().validate(ctx);
    await adminDao.changeUserPassword(ctx, v);
    ctx.success({
      code: 4
    });
  }
);

admin.linDelete(
  'deleteUser',
  '/user/:id',
  admin.permission('删除用户'),
  adminRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await adminDao.deleteUser(ctx, id);
    ctx.success({
      code: 5
    });
  }
);

admin.linPut(
  'updateUser',
  '/user/:id',
  admin.permission('管理员更新用户信息'),
  adminRequired,
  async ctx => {
    const v = await new UpdateUserInfoValidator().validate(ctx);
    await adminDao.updateUserInfo(ctx, v);
    ctx.success({
      code: 6
    });
  }
);

admin.linGet(
  'getAdminGroups',
  '/group',
  admin.permission('查询所有权限组及其权限'),
  adminRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { groups, total } = await adminDao.getGroups(
      ctx,
      v.get('query.page'),
      v.get('query.count')
    );
    if (groups.length < 1) {
      throw new NotFound({
        code: 10024
      });
    }
    ctx.json({
      items: groups,
      total: total,
      page: v.get('query.page'),
      count: v.get('query.count')
    });
  }
);

admin.linGet(
  'getAllGroup',
  '/group/all',
  admin.permission('查询所有权限组'),
  adminRequired,
  async ctx => {
    const groups = await adminDao.getAllGroups();
    if (!groups || groups.length < 1) {
      throw new NotFound({
        code: 10024
      });
    }
    ctx.json(groups);
  }
);

admin.linGet(
  'getGroup',
  '/group/:id',
  admin.permission('查询一个权限组及其权限'),
  adminRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const group = await adminDao.getGroup(ctx, v.get('path.id'));
    ctx.json(group);
  }
);

admin.linPost(
  'createGroup',
  '/group',
  admin.permission('新建权限组'),
  adminRequired,
  async ctx => {
    const v = await new NewGroupValidator().validate(ctx);
    const ok = await adminDao.createGroup(ctx, v);
    if (!ok) {
      throw new Failed({
        code: 10027
      });
    }
    ctx.success({
      code: 15
    });
  }
);

admin.linPut(
  'updateGroup',
  '/group/:id',
  admin.permission('更新一个权限组'),
  adminRequired,
  async ctx => {
    const v = await new UpdateGroupValidator().validate(ctx);
    await adminDao.updateGroup(ctx, v);
    ctx.success({
      code: 7
    });
  }
);

admin.linDelete(
  'deleteGroup',
  '/group/:id',
  admin.permission('删除一个权限组'),
  adminRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await adminDao.deleteGroup(ctx, id);
    ctx.success({
      code: 8
    });
  }
);

admin.linPost(
  'dispatchPermission',
  '/permission/dispatch',
  admin.permission('分配单个权限'),
  adminRequired,
  async ctx => {
    const v = await new DispatchPermissionValidator().validate(ctx);
    await adminDao.dispatchPermission(ctx, v);
    ctx.success({
      code: 9
    });
  }
);

admin.linPost(
  'dispatchPermissions',
  '/permission/dispatch/batch',
  admin.permission('分配多个权限'),
  adminRequired,
  async ctx => {
    const v = await new DispatchPermissionsValidator().validate(ctx);
    await adminDao.dispatchPermissions(ctx, v);
    ctx.success({
      code: 9
    });
  }
);

admin.linPost(
  'removePermissions',
  '/permission/remove',
  admin.permission('删除多个权限'),
  adminRequired,
  async ctx => {
    const v = await new RemovePermissionsValidator().validate(ctx);
    await adminDao.removePermissions(ctx, v);
    ctx.success({
      code: 10
    });
  }
);

export { admin };
