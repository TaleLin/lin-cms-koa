'use strict';
const fs = require('fs');
const path = require('path');

const { config } = require('lin-mizar/lin/config');

// router.post('/cms/file', async ctx => {
//   ctx.body = 'Hello World';
//   const files = await ctx.multipart();
//   console.log(files)
//   if (files.length < 1) {
//     throw new Error('未找到符合条件的文件资源');
//   }
//   const uploader = new LocalUploader('app/assets');
//   const arr = await uploader.upload(files);
// });

/**
 * 初始化并获取配置
 */
function applyConfig () {
  // 获取工作目录
  const baseDir = path.resolve(__dirname, '../');
  config.init(baseDir);
  const files = fs.readdirSync(path.resolve(`${baseDir}/app/config`));

  // 加载 config 目录下的配置文件
  for (const file of files) {
    config.getConfigFromFile(`app/config/${file}`);
  }

  // 加载其它配置文件
  config.getConfigFromFile('app/extension/file/config.js');
}

const run = async () => {
  applyConfig();
  const { createApp } = require('./app');
  const app = await createApp();
  const port = config.getItem('port');
  app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
  });
};

// 启动应用
run();
