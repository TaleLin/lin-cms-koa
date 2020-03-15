import { NotFound, Forbidden } from 'lin-mizar';
import { PermissionModel } from '../models/permission';
import { UserModel, UserIdentityModel } from '../models/user';
import { GroupModel } from '../models/group';

import { GroupPermissionModel } from '../models/group-permission';
import { UserGroupModel } from '../models/user-group';

import sequelize from '../libs/db';
import { Op } from 'sequelize';
import { has, set, get } from 'lodash';

class AdminDao {
  async getAllPermissions () {
    const permissions = await PermissionModel.findAll();
    const result = Object.create(null);
    permissions.forEach(v => {
      const item = {
        id: get(v, 'id'),
        name: get(v, 'name'),
        module: get(v, 'module')
      };
      if (has(result, item.module)) {
        result[item.module].push(item);
      } else {
        set(result, item.module, [item]);
      }
    });
    return result;
  }

  async getUsers (groupId, page, count1) {
    let userIds = [];
    const condition = {
      offset: page * count1,
      limit: count1
    };
    if (groupId) {
      const userGroup = await UserGroupModel.findAll({
        where: {
          group_id: groupId
        }
      });
      userIds = userGroup.map(v => v.user_id);
      Object.assign(condition, {
        where: {
          id: {
            [Op.in]: userIds
          }
        }
      });
    }
    const { rows, count } = await UserModel.findAndCountAll(condition);

    for (const user of rows) {
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
    }

    return {
      users: rows,
      total: count
    };
  }

  async changeUserPassword (ctx, v) {
    const user = await UserModel.findOne({
      where: {
        id: v.get('path.id')
      }
    });
    if (!user) {
      throw new NotFound({
        msg: '用户不存在',
        errorCode: 10021
      });
    }
    await UserIdentityModel.resetPassword(user, v.get('body.new_password'));
  }

  async deleteUser (ctx, id) {
    const user = await UserModel.findOne({
      where: {
        id
      }
    });
    if (!user) {
      throw new NotFound({
        msg: '用户不存在',
        errorCode: 10021
      });
    }
    let transaction;
    try {
      transaction = await sequelize.transaction();
      await user.destroy({
        transaction
      });
      await UserGroupModel.destroy({
        where: {
          user_id: id
        },
        transaction
      });
      await UserIdentityModel.destroy({
        where: {
          user_id: id
        },
        transaction
      });
      await transaction.commit();
    } catch (err) {
      if (transaction) await transaction.rollback();
    }
  }

  async updateUserInfo (ctx, v) {
    const user = await UserModel.findByPk(v.get('path.id'));
    if (!user) {
      throw new NotFound({
        msg: '用户不存在',
        errorCode: 10021
      });
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
          msg: '不可将用户分配给不存在的分组',
          errorCode: 10077
        });
      }
    }

    let transaction;
    try {
      transaction = await sequelize.transaction();
      await UserGroupModel.destroy({
        where: {
          user_id: v.get('path.id')
        },
        transaction
      });
      for (const id of v.get('body.group_ids') || []) {
        await UserGroupModel.create(
          {
            user_id: v.get('path.id'),
            group_id: id
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
  }

  async getGroups (ctx, page, count1) {
    const { rows, count } = await GroupModel.findAndCountAll({
      offset: page * count1,
      limit: count1
    });

    return {
      groups: rows,
      total: count
    };
  }

  async getAllGroups () {
    const allGroups = await GroupModel.findAll();
    return allGroups;
  }

  async getGroup (ctx, id) {
    const group = await GroupModel.findByPk(id);
    if (!group) {
      throw new NotFound({
        msg: '分组不存在',
        errorCode: 10024
      });
    }

    const groupPermission = await GroupPermissionModel.findAll({
      where: {
        group_id: id
      }
    });
    const permissionIds = groupPermission.map(v => v.permission_id);

    const permissions = await PermissionModel.findAll({
      where: {
        id: {
          [Op.in]: permissionIds
        }
      }
    });

    return set(group, 'permissions', permissions);
  }

  async createGroup (ctx, v) {
    const group = await GroupModel.findOne({
      where: {
        name: v.get('body.name')
      }
    });
    if (group) {
      throw new Forbidden({
        msg: '分组已存在，不可创建同名分组'
      });
    }

    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findByPk(id);
      if (!permission) {
        throw new NotFound({
          msg: '无法分配不存在的权限'
        });
      }
    }

    let transaction;
    try {
      transaction = await sequelize.transaction();

      const group = await GroupModel.create(
        {
          name: v.get('body.name'),
          info: v.get('body.info')
        },
        {
          transaction
        }
      );

      for (const id of v.get('body.permission_ids') || []) {
        await GroupPermissionModel.create(
          {
            group_id: group.id,
            permission_id: id
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
    const group = await GroupModel.findByPk(v.get('path.id'));
    if (!group) {
      throw new NotFound({
        msg: '分组不存在，更新失败'
      });
    }
    group.name = v.get('body.name');
    group.info = v.get('body.info');
    group.save();
  }

  async deleteGroup (ctx, id) {
    const group = await GroupModel.findByPk(id);
    if (!group) {
      throw new NotFound({
        msg: '分组不存在',
        errorCode: 10024
      });
    }
    if (group.name === 'root') {
      throw new Forbidden({
        msg: 'root分组不可删除',
        errorCode: 10074
      });
    } else if (group.name === 'guest') {
      throw new Forbidden({
        msg: 'guest分组不可删除',
        errorCode: 10075
      });
    }

    let transaction;
    try {
      transaction = await sequelize.transaction();
      await group.destroy({
        transaction
      });
      await GroupPermissionModel.destroy({
        where: {
          group_id: group.id
        },
        transaction
      });
      await UserGroupModel.destroy({
        where: {
          group_id: group.id
        },
        transaction
      });
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
    }
  }

  async dispatchPermission (ctx, v) {
    const group = await GroupModel.findByPk(v.get('body.group_id'));
    if (!group) {
      throw new NotFound({
        msg: '分组不存在'
      });
    }

    const permission = await PermissionModel.findByPk(
      v.get('body.permission_id')
    );
    if (!permission) {
      throw new NotFound({
        msg: '无法分配不存在的权限'
      });
    }

    const one = await GroupPermissionModel.findOne({
      where: {
        group_id: v.get('body.group_id'),
        permission_id: v.get('body.permission_id')
      }
    });
    if (one) {
      throw new Forbidden({
        msg: '已有权限，不可重复添加'
      });
    }
    await GroupPermissionModel.create({
      group_id: v.get('body.group_id'),
      permission_id: v.get('body.permission_id')
    });
  }

  async dispatchPermissions (ctx, v) {
    const group = await GroupModel.findByPk(v.get('body.group_id'));
    if (!group) {
      throw new NotFound({
        msg: '分组不存在'
      });
    }
    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findByPk(id);
      if (!permission) {
        throw new NotFound({
          msg: '无法分配不存在的权限'
        });
      }
    }

    let transaction;
    try {
      transaction = await sequelize.transaction();
      for (const id of v.get('body.permission_ids')) {
        await GroupPermissionModel.create(
          {
            group_id: group.id,
            permission_id: id
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
  }

  async removePermissions (ctx, v) {
    const group = await GroupModel.findByPk(v.get('body.group_id'));
    if (!group) {
      throw new NotFound({
        msg: '分组不存在'
      });
    }
    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findByPk(id);
      if (!permission) {
        throw new NotFound({
          msg: '无法分配不存在的权限'
        });
      }
    }

    await GroupPermissionModel.destroy({
      where: {
        group_id: v.get('body.group_id'),
        permission_id: {
          [Op.in]: v.get('body.permission_ids')
        }
      }
    });
  }
}

export { AdminDao };
