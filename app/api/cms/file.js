'use strict';

const { LinRouter, NotFound } = require('lin-mizar');
const { ratelimit } = require('lin-mizar/lin/limiter');
const { LocalUploader } = require('../../extensions/file/local-uploader');
const redis = require('redis');

const client = redis.createClient();

const file = new LinRouter({
  prefix: '/cms/file'
});

file.post('/', async ctx => {
  const files = await ctx.multipart();
  if (files.length < 1) {
    throw new NotFound({ msg: '未找到符合条件的文件资源' });
  }
  const uploader = new LocalUploader('app/assets');
  await uploader.upload(files);
  ctx.success();
});

file.get(
  '/',
  ratelimit({
    db: client,
    duration: 30 * 1000,
    max: 5,
    // throw: true,
    logging: true
  }),
  async ctx => {
    ctx.body = {
      msg: 'just a normal response.'
    };
  }
);

module.exports = { file };
