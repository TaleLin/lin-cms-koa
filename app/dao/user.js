import { RepeatException, generate, NotFound, Forbidden, config } from 'lin-mizar';
import { UserModel, UserIdentityModel, identityType } from '../model/user';
import { UserGroupModel } from '../model/user-group';
import { GroupPermissionModel } from '../model/group-permission';
import { PermissionModel } from '../model/permission';
import { GroupModel } from '../model/group';

import sequelize from '../lib/db';
import { Op } from 'sequelize';
import { set, has, uniq } from 'lodash';

class UserDao {
  async createUser (v) {
    let user = await UserModel.findOne({
      where: {
        username: v.get('body.username')
      }
    });
    if (user) {
      throw new RepeatException({
        msg: '已经有用户使用了该名称，请重新输入新的用户名',
        errorCode: 10071
      });
    }
    if (v.get('body.email') && v.get('body.email').trim() !== '') {
      user = await UserModel.findOne({
        where: {
          email: v.get('body.email')
        }
      });
      if (user) {
        throw new RepeatException({
          msg: '邮箱已被使用，请重新填入新的邮箱',
          errorCode: 10076
        });
      }
    }
    for (const id of v.get('body.group_ids') || []) {
      const group = await GroupModel.findByPk(id);
      if (group.name === 'root') {
        throw new Forbidden({
          msg: 'root分组不可添加用户',
          errorCode: 10073
        });
      }
      if (!group) {
        throw new NotFound({
          msg: '分组不存在，无法新建用户',
          errorCode: 10023
        });
      }
    }
    await this.registerUser(v);
  }

  async updateUser (ctx, v) {
    const user = ctx.currentUser;
    if (v.get('body.username') && user.username !== v.get('body.username')) {
      const exit = await UserModel.findOne({
        where: {
          username: v.get('body.username')
        }
      });
      if (exit) {
        throw new RepeatException({
          msg: '已经有用户使用了该名称，请重新输入新的用户名',
          errorCode: 10071
        });
      }
      user.username = v.get('body.username');
    }
    if (v.get('body.email') && user.email !== v.get('body.email')) {
      const exit = await UserModel.findOne({
        where: {
          email: v.get('body.email')
        }
      });
      if (exit) {
        throw new RepeatException({
          msg: '邮箱已被使用，请重新填入新的邮箱',
          errorCode: 10076
        });
      }
      user.email = v.get('body.email');
    }
    if (v.get('body.nickname')) {
      user.nickname = v.get('body.nickname');
    }
    if (v.get('body.avatar')) {
      user.avatar = v.get('body.avatar');
    }
    user.save();
  }

  async getInformation (ctx) {
    const user = ctx.currentUser;

    const userGroup = await UserGroupModel.findAll({
      where: {
        user_id: user.id
      }
    });
    const groupIds = userGroup.map(v => v.group_id);
    const groups = await GroupModel.findAll({
      where: {
        id: {
          [Op.in]: groupIds
        }
      }
    });
    
    set(user, 'groups', groups);
    return user;
  }

  async getPermissions (ctx) {
    const user = ctx.currentUser;
    const userGroup = await UserGroupModel.findAll({
      where: {
        user_id: user.id
      }
    });
    const groupIds = userGroup.map(v => v.group_id);

    const root = await GroupModel.findOne({
      where: {
        name: 'root',
        id: {
          [Op.in]: groupIds
        }
      }
    });

    set(user, 'admin', !!root);

    let permissions = [];

    if (root) {
      permissions = await PermissionModel.findAll();
    } else {
      const groupPermission = await GroupPermissionModel.findAll({
        where: {
          group_id: {
            [Op.in]: groupIds
          }
        }
      });

      const permissionIds = uniq(groupPermission.map(v => v.permission_id));

      permissions = await PermissionModel.findAll({
        where: {
          id: {
            [Op.in]: permissionIds
          }
        }
      });
    }

    set(user, 'permissions', this.formatPermissions(permissions));

    return user;
  }

  async registerUser (v) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const user = {
        username: v.get('body.username')
      };
      if (v.get('body.email') && v.get('body.email').trim() !== '') {
        user.email = v.get('body.email');
      }
      const { id: user_id } = await UserModel.create(user, {
        transaction
      });
      await UserIdentityModel.create(
        {
          user_id,
          identity_type: identityType,
          identifier: user.username,
          credential: generate(v.get('body.password'))
        },
        {
          transaction
        }
      );
      // 未指定分组，默认加入游客分组
      if (v.get('body.group_ids').length === 0) {
        const guest = await GroupModel.findOne({
          where: {
            name: 'guest'
          }
        });
        await UserGroupModel.create({
          user_id,
          group_id: guest.id
        });
      } else {
        for (const id of v.get('body.group_ids') || []) {
          await UserGroupModel.create(
            {
              user_id,
              group_id: id
            },
            {
              transaction
            }
          );
        }
      }
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
    }
    return true;
  }

  formatPermissions (permissions) {
    const map = {};
    permissions.forEach(v => {
      const module = v.module;
      if (has(map, module)) {
        map[module].push({
          permission: v.name,
          module
        });
      } else {
        set(map, module, [
          {
            permission: v.name,
            module
          }
        ]);
      }
    });
    return Object.keys(map).map(k => {
      const tmp = Object.create(null);
      set(tmp, k, map[k]);
      return tmp;
    });
  }
}

export { UserDao };
