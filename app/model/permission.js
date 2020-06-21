import { Model, Sequelize, Op } from 'sequelize';
import { routeMetaInfo, InfoCrudMixin } from 'lin-mizar';
import sequelize from '../lib/db';
import { GroupPermissionModel } from './group-permission';
import { MountType } from '../lib/type';
import { merge } from 'lodash';

class Permission extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      name: this.name,
      module: this.module
    };
    return origin;
  }

  static async initPermission () {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const info = Array.from(routeMetaInfo.values());
      const permissions = await this.findAll();

      for (const { permission: permissionName, module: moduleName } of info) {
        const exist = permissions.find(
          p => p.name === permissionName && p.module === moduleName
        );
        // 如果不存在这个 permission 则创建之
        if (!exist) {
          await this.create(
            {
              name: permissionName,
              module: moduleName
            },
            { transaction }
          );
        }
      }

      const permissionIds = [];
      for (const permission of permissions) {
        const exist = info.find(
          meta =>
            meta.permission === permission.name &&
            meta.module === permission.module
        );
        // 如果能找到这个 meta 则挂载之，否则卸载之
        if (exist) {
          permission.mount = MountType.Mount;
        } else {
          permission.mount = MountType.Unmount;
          permissionIds.push(permission.id);
        }
        await permission.save({
          transaction
        });
      }

      // 相应地要解除关联关系
      if (permissionIds.length) {
        await GroupPermissionModel.destroy({
          where: {
            permission_id: {
              [Op.in]: permissionIds
            }
          },
          transaction
        });
      }
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
    }
  }
}

Permission.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING({ length: 60 }),
      comment: '权限名称，例如：访问首页',
      allowNull: false
    },
    module: {
      type: Sequelize.STRING({ length: 50 }),
      comment: '权限所属模块，例如：人员管理',
      allowNull: false
    },
    mount: {
      type: Sequelize.BOOLEAN,
      comment: '0：关闭 1：开启',
      defaultValue: 1
    }
  },
  merge(
    {
      sequelize,
      tableName: 'lin_permission',
      modelName: 'permission'
    },
    InfoCrudMixin.options
  )
);

export { Permission as PermissionModel };
