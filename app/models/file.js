import { Model, Sequelize } from 'sequelize';
import sequelize from '../libs/db';

class File extends Model {
  static async createRecord (args, commit) {
    const record = File.build(args);
    commit && (await record.save());
    return record;
  }
}

File.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    path: {
      type: Sequelize.STRING({ length: 500 }),
      allowNull: false
    },
    type: {
      type: Sequelize.STRING({ length: 10 }),
      allowNull: false,
      defaultValue: 'LOCAL',
      comment: 'LOCAL 本地，REMOTE 远程'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    extension: {
      type: Sequelize.STRING(50)
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    // 建立索引，方便搜索
    // 域名配置
    md5: {
      type: Sequelize.STRING(40),
      allowNull: true,
      comment: '图片md5值，防止上传重复图片'
    }
  },
  {
    sequelize,
    indexes: [
      {
        name: 'md5_del',
        unique: true,
        fields: ['md5', 'delete_time']
      }
    ],
    tableName: 'lin_file',
    modelName: 'file',
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

export { File as FileModel };
