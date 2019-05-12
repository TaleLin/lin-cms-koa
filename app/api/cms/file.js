'use strict';

const { LinRouter } = require('lin-mizar');

const file = new LinRouter({
  prefix: '/cms/file'
});

file.get('/', async ctx => {
  ctx.type = 'html';
  ctx.body = 'file';
});

module.exports = { file };
