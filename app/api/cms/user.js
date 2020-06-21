import { LinRouter, getTokens } from 'lin-mizar';
import {
  RegisterValidator,
  LoginValidator,
  UpdateInfoValidator,
  ChangePasswordValidator
} from '../../validator/user';

import {
  adminRequired,
  loginRequired,
  refreshTokenRequiredWithUnifyException
} from '../../middleware/jwt';
import { UserIdentityModel } from '../../model/user';
import { logger } from '../../middleware/logger';
import { UserDao } from '../../dao/user';

const user = new LinRouter({
  prefix: '/cms/user',
  module: '用户',
  // 用户权限暂不支持分配，开启分配后也无实际作用
  mountPermission: false
});

const userDao = new UserDao();

user.linPost(
  'userRegister',
  '/register',
  user.permission('注册'),
  adminRequired,
  logger('管理员新建了一个用户'),
  async ctx => {
    const v = await new RegisterValidator().validate(ctx);
    await userDao.createUser(v);
    ctx.success({
      code: 11
    });
  }
);

user.linPost('userLogin', '/login', user.permission('登录'), async ctx => {
  const v = await new LoginValidator().validate(ctx);
  const user = await UserIdentityModel.verify(
    v.get('body.username'),
    v.get('body.password')
  );
  const { accessToken, refreshToken } = getTokens({
    id: user.user_id
  });
  ctx.json({
    access_token: accessToken,
    refresh_token: refreshToken
  });
});

user.linPut(
  'userUpdate',
  '/',
  user.permission('更新用户信息'),
  loginRequired,
  async ctx => {
    const v = await new UpdateInfoValidator().validate(ctx);
    await userDao.updateUser(ctx, v);
    ctx.success({
      code: 6
    });
  }
);

user.linPut(
  'userUpdatePassword',
  '/change_password',
  user.permission('修改密码'),
  loginRequired,
  async ctx => {
    const user = ctx.currentUser;
    const v = await new ChangePasswordValidator().validate(ctx);
    await UserIdentityModel.changePassword(
      user,
      v.get('body.old_password'),
      v.get('body.new_password')
    );
    ctx.success({
      code: 4
    });
  }
);

user.linGet(
  'userGetToken',
  '/refresh',
  user.permission('刷新令牌'),
  refreshTokenRequiredWithUnifyException,
  async ctx => {
    const user = ctx.currentUser;
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
);

user.linGet(
  'userGetPermissions',
  '/permissions',
  user.permission('查询自己拥有的权限'),
  loginRequired,
  async ctx => {
    const user = await userDao.getPermissions(ctx);
    ctx.json(user);
  }
);

user.linGet(
  'getInformation',
  '/information',
  user.permission('查询自己信息'),
  loginRequired,
  async ctx => {
    const info = await userDao.getInformation(ctx);
    ctx.json(info);
  }
);

export { user };
