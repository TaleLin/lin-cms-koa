import { Model, Sequelize } from 'sequelize';
import { InfoCrudMixin } from 'lin-mizar';
import sequelize from '../lib/db';
import { merge } from 'lodash';

class Log extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      message: this.message,
      time: this.create_time,
      user_id: this.user_id,
      username: this.username,
      status_code: this.status_code,
      method: this.method,
      path: this.path,
      permission: this.permission
    };
    return origin;
  }

  static createLog (args, commit) {
    const log = Log.build(args);
    commit && log.save();
    return log;
  }
}

Log.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: {
      type: Sequelize.STRING({ length: 450 })
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING(20)
    },
    status_code: {
      type: Sequelize.INTEGER
    },
    method: {
      type: Sequelize.STRING(20)
    },
    path: {
      type: Sequelize.STRING(50)
    },
    permission: {
      type: Sequelize.STRING(100)
    }
  },
  merge(
    {
      sequelize,
      tableName: 'lin_log',
      modelName: 'log'
    },
    InfoCrudMixin.options
  )
);

export { Log as LogModel };
