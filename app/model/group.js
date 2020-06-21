import { Model, Sequelize } from 'sequelize';
import { InfoCrudMixin } from 'lin-mizar';
import { has, get, merge } from 'lodash';
import sequelize from '../lib/db';

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
    },
    level: {
      type: Sequelize.INTEGER(2),
      defaultValue: 3,
      comment: '分组级别 1：root 2：guest 3：user（root、guest分组只能存在一个)'
    }
  },
  merge(
    {
      sequelize,
      tableName: 'lin_group',
      modelName: 'group',
      indexes: [
        {
          name: 'name_del',
          unique: true,
          fields: ['name', 'delete_time']
        }
      ]
    },
    InfoCrudMixin.options
  )
);

export { Group as GroupModel };
