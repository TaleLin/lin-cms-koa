import { get } from 'lodash';
import { routeMetaInfo, assert } from 'lin-mizar';
import { LogModel } from '../model/log';

const REG_XP = /(?<=\{)[^}]*(?=\})/g;

/**
 * 日志记录中间件
 * @param template 消息模板
 *
 * ```js
 * test.linGet(
 *  "getTestMessage",
 * "/json",
 *  {
 *   permission: "hello",
 *   module: "world",
 *   mount: true
 * },
 * loginRequired,
 * logger("{user.username}就是皮了一波"),
 * async ctx => {
 *   ctx.json({
 *     message: "物质决定意识，经济基础决定上层建筑"
 *   });
 *  }
 * );
 * ```
 */
export const logger = template => {
  return async (ctx, next) => {
    await next();
    // 取数据，写入到日志中
    writeLog(template, ctx);
  };
};

function writeLog (template, ctx) {
  const message = parseTemplate(
    template,
    ctx.currentUser,
    ctx.response,
    ctx.request
  );
  if (ctx.matched) {
    const info = findAuthAndModule(ctx);
    let permission = '';
    if (info) {
      permission = get(info, 'permission');
    }
    const statusCode = ctx.status || 0;
    LogModel.createLog(
      {
        message,
        user_id: ctx.currentUser.id,
        username: ctx.currentUser.username,
        status_code: statusCode,
        method: ctx.request.method,
        path: ctx.request.path,
        permission
      },
      true
    );
  }
}

/**
 * 通过当前的路由名找到对应的权限录入信息
 * @param ctx koa 的 context
 */
function findAuthAndModule (ctx) {
  const routeName = ctx._matchedRouteName || ctx.routerName;
  const endpoint = `${ctx.method} ${routeName}`;
  return routeMetaInfo.get(endpoint);
}

/**
 * 解析模板
 * @param template 消息模板
 * @param user 用户
 * @param response
 * @param request
 */
function parseTemplate (template, user, response, request) {
  REG_XP.lastIndex = 0;
  const res = REG_XP.exec(template);
  if (res) {
    res.forEach(item => {
      const index = item.lastIndexOf('.');
      assert(index !== -1, item + '中必须包含 . ,且为一个');
      const obj = item.substring(0, index);
      const prop = item.substring(index + 1, item.length);
      let it;
      switch (obj) {
        case 'user':
          it = get(user, prop, '');
          break;
        case 'response':
          it = get(response, prop, '');
          break;
        case 'request':
          it = get(request, prop, '');
          break;
        default:
          it = '';
          break;
      }
      template = template.replace(`{${item}}`, it);
    });
  }
  return template;
}
