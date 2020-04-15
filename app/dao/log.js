import Sequelize from 'sequelize';
import { LogModel } from '../model/log';
import { set } from 'lodash';
import sequelize from '../lib/db';

class LogDao {
  async getLogs (v) {
    const start = v.get('query.page');
    const count1 = v.get('query.count');
    const condition = {};
    v.get('query.name') && set(condition, 'user_name', v.get('query.name'));
    v.get('query.start') &&
      v.get('query.end') &&
      set(condition, 'create_time', {
        [Sequelize.Op.between]: [v.get('query.start'), v.get('query.end')]
      });
    const { rows, count } = await LogModel.findAndCountAll({
      where: Object.assign({}, condition),
      offset: start * count1,
      limit: count1,
      order: [['create_time', 'DESC']]
    });
    return {
      rows,
      total: count
    };
  }

  async searchLogs (v, keyword) {
    const start = v.get('query.page');
    const count1 = v.get('query.count');
    const condition = {};
    v.get('query.name') && set(condition, 'username', v.get('query.name'));
    v.get('query.start') &&
      v.get('query.end') &&
      set(condition, 'create_time', {
        [Sequelize.Op.between]: [v.get('query.start'), v.get('query.end')]
      });
    const { rows, count } = await LogModel.findAndCountAll({
      where: Object.assign({}, condition, {
        message: {
          [Sequelize.Op.like]: `%${keyword}%`
        }
      }),
      offset: start * count1,
      limit: count1,
      order: [['create_time', 'DESC']]
    });
    return {
      rows,
      total: count
    };
  }

  async getUserNames (start, count) {
    const logs = await sequelize.query(
      'SELECT lin_log.username AS names FROM lin_log GROUP BY lin_log.username HAVING COUNT(lin_log.username)>0 limit :count offset :start',
      {
        replacements: {
          start: start * count,
          count: count
        }
      }
    );
    const arr = Array.from(logs[0].map(it => it.names));
    return arr;
  }
}

export { LogDao };
