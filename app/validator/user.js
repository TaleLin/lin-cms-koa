import { LinValidator, Rule } from 'lin-mizar';
import { isOptional } from '../lib/util';
import validator from 'validator';

class RegisterValidator extends LinValidator {
  constructor () {
    super();
    this.username = [
      new Rule('isNotEmpty', '用户名不可为空'),
      new Rule('isLength', '用户名长度必须在2~20之间', 2, 20)
    ];
    this.email = [
      new Rule('isOptional'),
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
    ];
    this.password = [
      new Rule(
        'matches',
        '密码长度必须在6~22位之间，包含字符、数字和 _ ',
        /^[A-Za-z0-9_*&$#@]{6,22}$/
      )
    ];
    this.confirm_password = new Rule('isNotEmpty', '确认密码不可为空');
  }

  validateConfirmPassword (data) {
    if (!data.body.password || !data.body.confirm_password) {
      return [false, '两次输入的密码不一致，请重新输入'];
    }
    const ok = data.body.password === data.body.confirm_password;
    if (ok) {
      return ok;
    } else {
      return [false, '两次输入的密码不一致，请重新输入'];
    }
  }

  validateGroupIds (data) {
    const ids = data.body.group_ids;
    if (isOptional(ids)) {
      return true;
    }
    if (!Array.isArray(ids)) {
      return [false, '每个id值必须为正整数'];
    }
    for (let id of ids) {
      if (typeof id === 'number') {
        id = String(id);
      }
      if (!validator.isInt(id, { min: 1 })) {
        return [false, '每个id值必须为正整数'];
      }
    }
    return true;
  }
}

class LoginValidator extends LinValidator {
  constructor () {
    super();
    this.username = new Rule('isNotEmpty', '用户名不可为空');
    this.password = new Rule('isNotEmpty', '密码不可为空');
  }
}

/**
 * 更新用户信息
 */
class UpdateInfoValidator extends LinValidator {
  constructor () {
    super();
    this.email = [
      new Rule('isOptional'),
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
    ];
    this.nickname = [
      new Rule('isOptional'),
      new Rule('isLength', '昵称长度必须在2~10之间', 2, 24)
    ];
    this.username = [
      new Rule('isOptional'),
      new Rule('isLength', '用户名长度必须在2~10之间', 2, 24)
    ];
    this.avatar = [
      new Rule('isOptional'),
      new Rule('isLength', '头像的url长度必须在0~500之间', {
        min: 0,
        max: 500
      })
    ];
  }
}

class ChangePasswordValidator extends LinValidator {
  constructor () {
    super();
    this.new_password = new Rule(
      'matches',
      '密码长度必须在6~22位之间，包含字符、数字和 _ ',
      /^[A-Za-z0-9_*&$#@]{6,22}$/
    );
    this.confirm_password = new Rule('isNotEmpty', '确认密码不可为空');
    this.old_password = new Rule('isNotEmpty', '请输入旧密码');
  }

  validateConfirmPassword (data) {
    if (!data.body.new_password || !data.body.confirm_password) {
      return [false, '两次输入的密码不一致，请重新输入'];
    }
    const ok = data.body.new_password === data.body.confirm_password;
    if (ok) {
      return ok;
    } else {
      return [false, '两次输入的密码不一致，请重新输入'];
    }
  }
}

class AvatarUpdateValidator extends LinValidator {
  constructor () {
    super();
    this.avatar = new Rule('isNotEmpty', '必须传入头像的url链接');
  }
}

export {
  ChangePasswordValidator,
  UpdateInfoValidator,
  LoginValidator,
  RegisterValidator,
  AvatarUpdateValidator
};
