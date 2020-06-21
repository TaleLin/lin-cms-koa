import {
  NotFound,
  verify,
  AuthFailed,
  generate,
  Failed,
  config,
  InfoCrudMixin
} from 'lin-mizar';
import sequelize from '../lib/db';
import { IdentityType } from '../lib/type';
import { Model, Sequelize } from 'sequelize';
import { get, has, unset, merge } from 'lodash';

class UserIdentity extends Model {
  checkPassword (raw) {
    if (!this.credential || this.credential === '') {
      return false;
    }
    return verify(raw, this.credential);
  }

  static async verify (username, password) {
    const user = await this.findOne({
      where: {
        identity_type: IdentityType.Password,
        identifier: username
      }
    });
    if (!user) {
      throw new NotFound({ code: 10021 });
    }
    if (!user.checkPassword(password)) {
      throw new AuthFailed({ code: 10031 });
    }
    return user;
  }

  static async changePassword (currentUser, oldPassword, newPassword) {
    const user = await this.findOne({
      where: {
        identity_type: IdentityType.Password,
        identifier: currentUser.username
      }
    });
    if (!user) {
      throw new NotFound({ code: 10021 });
    }
    if (!user.checkPassword(oldPassword)) {
      throw new Failed({
        code: 10011
      });
    }
    user.credential = generate(newPassword);
    await user.save();
  }

  static async resetPassword (currentUser, newPassword) {
    const user = await this.findOne({
      where: {
        identity_type: IdentityType.Password,
        identifier: currentUser.username
      }
    });
    if (!user) {
      throw new NotFound({ code: 10021 });
    }
    user.credential = generate(newPassword);
    await user.save();
  }
}

UserIdentity.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '用户id'
    },
    identity_type: {
      type: Sequelize.STRING({ length: 100 }),
      allowNull: false,
      comment: '登录类型（手机号 邮箱 用户名）或第三方应用名称（微信 微博等）'
    },
    identifier: {
      type: Sequelize.STRING({ length: 100 }),
      comment: '标识（手机号 邮箱 用户名或第三方应用的唯一标识）'
    },
    credential: {
      type: Sequelize.STRING({ length: 100 }),
      comment: '密码凭证（站内的保存密码，站外的不保存或保存token）'
    }
  },
  merge(
    {
      sequelize,
      tableName: 'lin_user_identity',
      modelName: 'user_identity'
    },
    InfoCrudMixin.options
  )
);

class User extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      username: this.username,
      nickname: this.nickname,
      email: this.email,
      avatar: `${config.getItem('siteDomain', 'http://localhost')}/assets/${
        this.avatar
      }`
    };
    if (has(this, 'groups')) {
      return { ...origin, groups: get(this, 'groups', []) };
    } else if (has(this, 'permissions')) {
      unset(origin, 'username');
      return {
        ...origin,
        admin: get(this, 'admin', false),
        permissions: get(this, 'permissions', [])
      };
    }
    return origin;
  }
}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING({ length: 24 }),
      allowNull: false,
      comment: '用户名，唯一'
    },
    nickname: {
      type: Sequelize.STRING({ length: 24 }),
      comment: '用户昵称'
    },
    avatar: {
      // 用户默认生成图像，为null
      type: Sequelize.STRING({ length: 500 }),
      comment: '头像url'
      // get() {
      //   return config.getItem('siteDomain').replace(/\/+$/, '') + '/assets/' + this.getDataValue('avatar')
      // }
    },
    email: {
      type: Sequelize.STRING({ length: 100 }),
      allowNull: true
    }
  },
  merge(
    {
      sequelize,
      tableName: 'lin_user',
      modelName: 'user',
      indexes: [
        {
          name: 'username_del',
          unique: true,
          fields: ['username', 'delete_time']
        },
        {
          name: 'email_del',
          unique: true,
          fields: ['email', 'delete_time']
        }
      ]
    },
    InfoCrudMixin.options
  )
);

export { User as UserModel, UserIdentity as UserIdentityModel };
