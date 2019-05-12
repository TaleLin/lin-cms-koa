'use strict';

const { config } = require('lin-mizar/lin/config');

// 1. 必须最开始加载配置，因为其他很多扩展依赖于配置
function applyConfig () {
  // TODO: 自动加载app/config下的所有配置文件
  config.getConfigFromFile('app/config/setting.js');
  config.getConfigFromFile('app/config/secure.js');
}

const run = async () => {
  applyConfig();
  const { createApp } = require('./app');
  const app = await createApp();
  app.listen(5000, () => {
    app.context.logger.start('listening at http://localhost:5000');
  });
};
// 启动应用
run();
