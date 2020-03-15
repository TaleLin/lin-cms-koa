import sequelize from '../libs/db';
import { Model, Sequelize } from 'sequelize';
import { has, get } from 'lodash';

class Group extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      name: this.name,
      info: this.info
    };
    if (has(this, 'permissions')) {
      return { ...origin, permissions: get(this, 'permissions', []) };
    }
    return origin;
  }
}

Group.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING({ length: 60 }),
      allowNull: false,
      comment: '分组名称，例如：搬砖者'
    },
    info: {
      type: Sequelize.STRING({ length: 255 }),
      allowNull: true,
      comment: '分组信息：例如：搬砖的人'
    }
  },
  {
    sequelize,
    indexes: [
      {
        name: 'name_del',
        unique: true,
        fields: ['name', 'delete_time']
      }
    ],
    tableName: 'lin_group',
    modelName: 'group',
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: 'delete_time',
    paranoid: true,
    getterMethods: {
      createTime () {
        // @ts-ignore
        return new Date(this.getDataValue('create_time')).getTime();
      },
      updateTime () {
        // @ts-ignore
        return new Date(this.getDataValue('update_time')).getTime();
      }
    }
  }
);

export { Group as GroupModel };
