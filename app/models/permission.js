import sequelize from '../libs/db';
import { Model, Sequelize, Op } from 'sequelize';
import { routeMetaInfo } from 'lin-mizar';
import { GroupPermissionModel } from './group-permission';

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
        if (
          permissions.find(
            permission =>
              permission.name === permissionName &&
              permission.module === moduleName
          )
        ) {
          continue;
        }
        await this.create(
          {
            name: permissionName,
            module: moduleName
          },
          { transaction }
        );
      }
      const permissionIds = [];
      for (const { id, name, module: moduleName } of permissions) {
        if (
          info.find(val => val.permission === name && val.module === moduleName)
        ) {
          continue;
        }
        await this.destroy({
          where: {
            id
          },
          transaction
        });
        permissionIds.push(id);
      }
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
    }
  },
  {
    sequelize,
    tableName: 'lin_permission',
    modelName: 'permission',
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: 'delete_time',
    paranoid: true,
    getterMethods: {
      createTime () {
        return new Date(this.getDataValue('create_time')).getTime();
      },
      updateTime () {
        return new Date(this.getDataValue('update_time')).getTime();
      }
    }
  }
);

export { Permission as PermissionModel };
