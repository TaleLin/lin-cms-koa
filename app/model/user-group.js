import { Model, Sequelize } from 'sequelize';
import sequelize from '../lib/db';

class UserGroup extends Model {}

UserGroup.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '分组id'
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '用户id'
    }
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'lin_user_group',
    modelName: 'user_group',
    indexes: [
      {
        name: 'user_id_group_id',
        using: 'BTREE',
        fields: ['user_id', 'group_id']
      }
    ]
  }
);

export { UserGroup as UserGroupModel };
