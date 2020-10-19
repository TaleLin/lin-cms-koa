import { Rule, LinValidator } from 'lin-mizar';
import { isOptional } from '../lib/util';
import { PaginateValidator, PositiveIdValidator } from './common';
import validator from 'validator';

class AdminUsersValidator extends PaginateValidator {
  constructor () {
    super();
    this.group_id = [
      new Rule('isOptional'),
      new Rule('isInt', '分组id必须为正整数', { min: 1 })
    ];
  }
}

class ResetPasswordValidator extends PositiveIdValidator {
  constructor () {
    super();
    this.new_password = new Rule(
      'matches',
      '密码长度必须在6~22位之间，包含字符、数字和 _ ',
      /^[A-Za-z0-9_*&$#@]{6,22}$/
    );
    this.confirm_password = new Rule('isNotEmpty', '确认密码不可为空');
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

class UpdateUserInfoValidator extends PositiveIdValidator {
  validateGroupIds (data) {
    const ids = data.body.group_ids;
    if (!Array.isArray(ids) || ids.length < 1) {
      return [false, '至少选择一个分组'];
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

class UpdateGroupValidator extends PositiveIdValidator {
  constructor () {
    super();
    this.name = new Rule('isNotEmpty', '请输入分组名称');
    this.info = new Rule('isOptional');
  }
}

class RemovePermissionsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule('isInt', '分组id必须正整数');
  }

  validatePermissionIds (data) {
    const ids = data.body.permission_ids;
    if (!ids) {
      return [false, '请输入permission_ids字段'];
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

class DispatchPermissionsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule('isInt', '分组id必须正整数');
  }

  validatePermissionIds (data) {
    const ids = data.body.permission_ids;
    if (!ids) {
      return [false, '请输入permission_ids字段'];
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

class NewGroupValidator extends LinValidator {
  constructor () {
    super();
    this.name = new Rule('isNotEmpty', '请输入分组名称');
    this.info = new Rule('isOptional');
  }

  validatePermissionIds (data) {
    const ids = data.body.permission_ids;
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

class DispatchPermissionValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule('isInt', '分组id必须正整数');
    this.permission_id = new Rule('isNotEmpty', '请输入permission_id字段');
  }
}

export {
  AdminUsersValidator,
  ResetPasswordValidator,
  UpdateGroupValidator,
  UpdateUserInfoValidator,
  DispatchPermissionValidator,
  DispatchPermissionsValidator,
  NewGroupValidator,
  RemovePermissionsValidator
};
