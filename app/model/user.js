import { NotFound, verify, AuthFailed, generate, Failed, config } from 'lin-mizar';

import sequelize from '../lib/db';
import { Model, Sequelize } from 'sequelize';
import { get, has, unset } from 'lodash';

const type = 'USERNAME_PASSWORD';

class UserIdentity extends Model {
  static async verify (username, password) {
    const user = await this.findOne({
      where: {
        identity_type: type,
        identifier: username
      }
    });
    if (!user) {
      throw new NotFound({ msg: '用户不存在', errorCode: 10021 });
    }
    if (!user.checkPassword(password)) {
      throw new AuthFailed({ msg: '用户名或密码错误', errorCode: 10031 });
    }
    return user;
  }

  checkPassword (raw) {
    if (!this.credential || this.credential === '') {
      return false;
    }
    return verify(raw, this.credential);
  }

  static async changePassword (currentUser, oldPassword, newPassword) {
    const user = await this.findOne({
      where: {
        identity_type: type,
        identifier: currentUser.username
      }
    });
    if (!user) {
      throw new NotFound({ msg: '用户不存在', errorCode: 10021 });
    }
    if (!user.checkPassword(oldPassword)) {
      throw new Failed({
        msg: '修改密码失败，你可能输入了错误的旧密码'
      });
    }
    user.credential = generate(newPassword);
    user.save();
  }

  static async resetPassword (currentUser, newPassword) {
    const user = await this.findOne({
      where: {
        identity_type: type,
        identifier: currentUser.username
      }
    });
    if (!user) {
      throw new NotFound({ msg: '用户不存在', errorCode: 10021 });
    }
    user.credential = generate(newPassword);
    user.save();
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
  {
    sequelize,
    tableName: 'lin_user_identity',
    modelName: 'user_identity',
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: 'delete_time',
    paranoid: true,
    getterMethods: {
      createTime () {
        // @ts-ignore
        return new Date(this.getDataValue('create_time')).getTime();
      },
      updateTime () {
        // @ts-ignore
        return new Date(this.getDataValue('update_time')).getTime();
      }
    }
  }
);

class User extends Model {
  toJSON () {
    const origin = {
      id: this.id,
      username: this.username,
      nickname: this.nickname,
      email: this.email,
      avatar: `${config.getItem('siteDomain', 'http://localhost')}/assets/${this.avatar}`
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
  {
    sequelize,
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
    ],
    modelName: 'user',
    tableName: 'lin_user',
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: 'delete_time',
    paranoid: true,
    getterMethods: {
      createTime () {
        // @ts-ignore
        return new Date(this.getDataValue('create_time')).getTime();
      },
      updateTime () {
        // @ts-ignore
        return new Date(this.getDataValue('update_time')).getTime();
      }
    }
  }
);

export {
  type as identityType,
  User as UserModel,
  UserIdentity as UserIdentityModel
};
