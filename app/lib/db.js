import { config } from 'lin-mizar';
import { Sequelize } from 'sequelize';

/**
 * 数据库名，默认lin-cms
 */
const database = config.getItem('db.database', 'lin-cms');

/**
 * 数据库用户名，默认root
 */
const username = config.getItem('db.username', 'root');

/**
 * 数据库密码，默认123456
 */
const password = config.getItem('db.password', '123456');

/**
 * 其它数据库配置项
 */
const options = config.getItem('db', {});

/**
 * 全局的 Sequelize 实例
 */
const sequelize = new Sequelize(database, username, password, {
  ...options
});

sequelize.sync({
  force: false
});

export default sequelize;
