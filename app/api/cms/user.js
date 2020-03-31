import { LinRouter, getTokens } from 'lin-mizar';
import {
  RegisterValidator,
  LoginValidator,
  UpdateInfoValidator,
  ChangePasswordValidator
} from '../../validators/user';

import {
  adminRequired,
  loginRequired,
  refreshTokenRequiredWithUnifyException
} from '../../middleware/jwt';
import { UserIdentityModel } from '../../models/user';
import { logger } from '../../middleware/logger';
import { UserDao } from '../../dao/user';

const user = new LinRouter({
  prefix: '/cms/user'
});

const userDao = new UserDao();

user.linPost(
  'userRegister',
  '/register',
  {
    permission: '注册',
    module: '用户',
    mount: false
  },
  adminRequired,
  logger('管理员新建了一个用户'),
  async ctx => {
    const v = await new RegisterValidator().validate(ctx);
    await userDao.createUser(v);
    ctx.success({
      msg: '注册成功',
      errorCode: 9
    });
  }
);

user.linPost(
  'userLogin',
  '/login',
  {
    permission: '登陆',
    module: '用户',
    mount: false
  },
  async ctx => {
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
  }
);

user.linPut(
  'userUpdate',
  '/',
  {
    permission: '更新用户信息',
    module: '用户',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new UpdateInfoValidator().validate(ctx);
    await userDao.updateUser(ctx, v);
    ctx.success({
      msg: '更新用户成功',
      errorCode: 4
    });
  }
);

user.linPut(
  'userUpdatePassword',
  '/change_password',
  {
    permission: '修改密码',
    module: '用户',
    mount: false
  },
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
      msg: '密码修改成功',
      errorCode: 2
    });
  }
);

user.linGet(
  'userGetToken',
  '/refresh',
  {
    permission: '刷新令牌',
    module: '用户',
    mount: false
  },
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
  {
    permission: '查询自己拥有的权限',
    module: '用户',
    mount: true
  },
  loginRequired,
  async ctx => {
    const user = await userDao.getPermissions(ctx);
    ctx.json(user);
  }
);

user.linGet(
  'getInformation',
  '/information',
  {
    permission: '查询自己信息',
    module: '用户',
    mount: true
  },
  loginRequired,
  async ctx => {
    const info = await userDao.getInformation(ctx);
    ctx.json(info);
  }
);

export { user };
