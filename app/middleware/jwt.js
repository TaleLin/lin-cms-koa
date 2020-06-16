import {
  NotFound,
  AuthFailed,
  parseHeader,
  RefreshException,
  TokenType,
  routeMetaInfo
} from 'lin-mizar';
import { UserGroupModel } from '../model/user-group';
import { GroupModel } from '../model/group';
import { GroupPermissionModel } from '../model/group-permission';
import { PermissionModel } from '../model/permission';
import { UserModel } from '../model/user';
import { MountType, GroupLevel } from '../lib/type';
import { Op } from 'sequelize';
import { uniq } from 'lodash';

// 是否超级管理员
async function isAdmin (ctx) {
  const userGroup = await UserGroupModel.findAll({
    where: {
      user_id: ctx.currentUser.id
    }
  });
  const groupIds = userGroup.map(v => v.group_id);
  const is = await GroupModel.findOne({
    where: {
      level: GroupLevel.Root,
      id: {
        [Op.in]: groupIds
      }
    }
  });
  return is;
}

/**
 * 将 user 挂在 ctx 上
 */
async function mountUser (ctx) {
  const { identity } = parseHeader(ctx);
  const user = await UserModel.findByPk(identity);
  if (!user) {
    throw new NotFound({
      code: 10021
    });
  }
  // 将user挂在ctx上
  ctx.currentUser = user;
}

/**
 * 守卫函数，非超级管理员不可访问
 */
async function adminRequired (ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx);

    if (await isAdmin(ctx)) {
      await next();
    } else {
      throw new AuthFailed({
        code: 10001
      });
    }
  } else {
    await next();
  }
}

/**
 * 守卫函数，用户登陆即可访问
 */
async function loginRequired (ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx);

    await next();
  } else {
    await next();
  }
}

/**
 * 守卫函数，用户刷新令牌，统一异常
 */
async function refreshTokenRequiredWithUnifyException (ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    try {
      const { identity } = parseHeader(ctx, TokenType.REFRESH);
      const user = await UserModel.findByPk(identity);
      if (!user) {
        ctx.throw(
          new NotFound({
            code: 10021
          })
        );
      }
      // 将user挂在ctx上
      ctx.currentUser = user;
    } catch (error) {
      throw new RefreshException();
    }
    await next();
  } else {
    await next();
  }
}

/**
 * 守卫函数，用于权限组鉴权
 */
async function groupRequired (ctx, next) {
  if (ctx.request.method !== 'OPTIONS') {
    await mountUser(ctx);

    // 超级管理员
    if (await isAdmin(ctx)) {
      await next();
    } else {
      if (ctx.matched) {
        const routeName = ctx._matchedRouteName || ctx.routerName;
        const endpoint = `${ctx.method} ${routeName}`;
        const { permission, module } = routeMetaInfo.get(endpoint);
        const userGroup = await UserGroupModel.findAll({
          where: {
            user_id: ctx.currentUser.id
          }
        });
        const groupIds = userGroup.map(v => v.group_id);
        const groupPermission = await GroupPermissionModel.findAll({
          where: {
            group_id: {
              [Op.in]: groupIds
            }
          }
        });
        const permissionIds = uniq(groupPermission.map(v => v.permission_id));
        const item = await PermissionModel.findOne({
          where: {
            name: permission,
            mount: MountType.Mount,
            module,
            id: {
              [Op.in]: permissionIds
            }
          }
        });
        if (item) {
          await next();
        } else {
          throw new AuthFailed({
            code: 10001
          });
        }
      } else {
        throw new AuthFailed({
          code: 10001
        });
      }
    }
  } else {
    await next();
  }
}

export {
  adminRequired,
  loginRequired,
  groupRequired,
  refreshTokenRequiredWithUnifyException
};
