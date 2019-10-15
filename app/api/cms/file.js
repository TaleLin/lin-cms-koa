'use strict';

const { LinRouter, ParametersException, loginRequired } = require('lin-mizar');
const { LocalUploader } = require('../../extensions/file/local-uploader');

const file = new LinRouter({
  prefix: '/cms/file'
});

file.linPost('upload', '/', {}, loginRequired, async ctx => {
  const files = await ctx.multipart();
  if (files.length < 1) {
    throw new ParametersException({ msg: '未找到符合条件的文件资源' });
  }
  const uploader = new LocalUploader('app/assets');
  const arr = await uploader.upload(files);
  ctx.json(arr);
});

module.exports = { file };
