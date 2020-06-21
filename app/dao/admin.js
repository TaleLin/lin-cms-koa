import { NotFound, Forbidden } from 'lin-mizar';
import { PermissionModel } from '../model/permission';
import { UserModel, UserIdentityModel } from '../model/user';
import { GroupModel } from '../model/group';

import { GroupPermissionModel } from '../model/group-permission';
import { UserGroupModel } from '../model/user-group';

import sequelize from '../lib/db';
import { MountType, GroupLevel } from '../lib/type';
import { Op } from 'sequelize';
import { has, set, get } from 'lodash';

class AdminDao {
  async getAllPermissions () {
    const permissions = await PermissionModel.findAll({
      where: {
        mount: MountType.Mount
      }
    });
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
      where: {
        username: {
          [Op.ne]: 'root'
        }
      },
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
      set(condition, 'where.id', {
        [Op.in]: userIds
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
    const user = await UserModel.findByPk(v.get('path.id'));
    if (!user) {
      throw new NotFound({
        code: 10021
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
        code: 10021
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
        code: 10021
      });
    }

    const userGroup = await UserGroupModel.findAll({
      where: {
        user_id: user.id
      }
    });
    const groupIds = userGroup.map(v => v.group_id);
    const isAdmin = await GroupModel.findOne({
      where: {
        level: GroupLevel.Root,
        id: {
          [Op.in]: groupIds
        }
      }
    });

    if (isAdmin) {
      throw new Forbidden({
        code: 10078
      });
    }

    for (const id of v.get('body.group_ids') || []) {
      const group = await GroupModel.findByPk(id);
      if (group.level === GroupLevel.Root) {
        throw new Forbidden({
          code: 10073
        });
      }
      if (!group) {
        throw new NotFound({
          code: 10077
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
    const allGroups = await GroupModel.findAll({
      where: {
        level: {
          [Op.ne]: GroupLevel.Root
        }
      }
    });
    return allGroups;
  }

  async getGroup (ctx, id) {
    const group = await GroupModel.findByPk(id);
    if (!group) {
      throw new NotFound({
        code: 10024
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
        mount: MountType.Mount,
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
        code: 10072
      });
    }

    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount
        }
      });
      if (!permission) {
        throw new NotFound({
          code: 10231
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
        code: 10024
      });
    }
    group.name = v.get('body.name');
    group.info = v.get('body.info');
    await group.save();
  }

  async deleteGroup (ctx, id) {
    const group = await GroupModel.findByPk(id);
    if (!group) {
      throw new NotFound({
        code: 10024
      });
    }
    if (group.level === GroupLevel.Root) {
      throw new Forbidden({
        code: 10074
      });
    } else if (group.level === GroupLevel.Guest) {
      throw new Forbidden({
        code: 10075
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
        code: 10024
      });
    }

    const permission = await PermissionModel.findOne({
      where: {
        id: v.get('body.permission_id'),
        mount: MountType.Mount
      }
    });
    if (!permission) {
      throw new NotFound({
        code: 10231
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
        code: 10230
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
        code: 10024
      });
    }
    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount
        }
      });
      if (!permission) {
        throw new NotFound({
          code: 10231
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
        code: 10024
      });
    }
    for (const id of v.get('body.permission_ids') || []) {
      const permission = await PermissionModel.findOne({
        where: {
          id,
          mount: MountType.Mount
        }
      });
      if (!permission) {
        throw new NotFound({
          code: 10231
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
