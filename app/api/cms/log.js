import { LinRouter, NotFound } from 'lin-mizar';
import { LogFindValidator } from '../../validators/log';
import { PaginateValidator } from '../../validators/common';

import { groupRequired } from '../../middleware/jwt';
import { LogDao } from '../../dao/log';

const log = new LinRouter({
  prefix: '/cms/log'
});

const logDao = new LogDao();

log.linGet(
  'getLogs',
  '/',
  {
    auth: '查询所有日志',
    module: '日志',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new LogFindValidator().validate(ctx);
    const { rows, total } = await logDao.getLogs(v);
    if (!rows || rows.length < 1) {
      throw new NotFound({
        msg: '没有找到相关日志'
      });
    }
    ctx.json({
      total: total,
      items: rows,
      page: v.get('query.page'),
      count: v.get('query.count')
    });
  }
);

log.linGet(
  'getUserLogs',
  '/search',
  {
    auth: '搜索日志',
    module: '日志',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new LogFindValidator().validate(ctx);
    const keyword = v.get('query.keyword', false, '');
    const { rows, total } = await logDao.searchLogs(v, keyword);
    ctx.json({
      total: total,
      items: rows,
      page: v.get('query.page'),
      count: v.get('query.count')
    });
  }
);

log.linGet(
  'getUsers',
  '/users',
  {
    auth: '查询日志记录的用户',
    module: '日志',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const arr = await logDao.getUserNames(
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      total: arr.length,
      items: arr,
      page: v.get('query.page'),
      count: v.get('query.count')
    });
  }
);

export { log };
