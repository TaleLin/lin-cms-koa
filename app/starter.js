'use strict';

const { config } = require('lin-mizar/lin/config');
const fs = require('fs');

// 1. 必须最开始加载配置，因为其他很多扩展依赖于配置
function applyConfig () {
  const cwd = process.cwd();
  const files = fs.readdirSync(`${cwd}/app/config`);
  for (const file of files) {
    config.getConfigFromFile(`app/config/${file}`);
  }
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
