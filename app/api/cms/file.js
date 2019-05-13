'use strict';

const { LinRouter } = require('lin-mizar');
const { LocalUploader } = require('../../extensions/file/local-uploader');

const file = new LinRouter({
  prefix: '/cms/file'
});

file.post('/', async ctx => {
  const files = await ctx.multipart();
  const uploader = new LocalUploader('app/assets');
  await uploader.upload(files);
  ctx.success();
});

module.exports = { file };
