import { LinRouter, getTokens, config } from 'lin-mizar';
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
import { generateCaptcha } from '../../lib/captcha';

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
    if (config.getItem('socket.enable')) {
      const username = v.get('body.username');
      ctx.websocket.broadCast(
        JSON.stringify({
          name: username,
          content: `管理员${ctx.currentUser.getDataValue(
            'username'
          )}新建了一个用户${username}`,
          time: new Date()
        })
      );
    }
    ctx.success({
      code: 11
    });
  }
);

user.linPost('userLogin', '/login', user.permission('登录'), async ctx => {
  const v = await new LoginValidator().validate(ctx);
  const { accessToken, refreshToken } = await userDao.getTokens(v, ctx);
  ctx.json({
    access_token: accessToken,
    refresh_token: refreshToken
  });
});

user.linPost('userCaptcha', '/captcha', async ctx => {
  let tag = null;
  let image = null;

  if (config.getItem('loginCaptchaEnabled', false)) {
    ({ tag, image } = await generateCaptcha());
  }

  ctx.json({
    tag,
    image
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
