"use strict";

const { Rule, LinValidator, isNotEmpty } = require("lin-mizar");
const { PaginateValidator, PositiveIdValidator } = require("./common");

class AdminUsersValidator extends PaginateValidator {
  constructor () {
    super();
    this.group_id = [
      new Rule("isOptional"),
      new Rule("isInt", "分组id必须为正整数", { min: 1 })
    ];
  }
}

class ResetPasswordValidator extends PositiveIdValidator {
  constructor () {
    super();
    this.new_password = new Rule(
      "matches",
      "密码长度必须在6~22位之间，包含字符、数字和 _ ",
      /^[A-Za-z0-9_*&$#@]{6,22}$/
    );
    this.confirm_password = new Rule("isNotEmpty", "确认密码不可为空");
  }

  validateConfirmPassword (data) {
    if (!data.body.new_password || !data.body.confirm_password) {
      return [false, "两次输入的密码不一致，请重新输入"];
    }
    let ok = data.body.new_password === data.body.confirm_password;
    if (ok) {
      return ok;
    } else {
      return [false, "两次输入的密码不一致，请重新输入"];
    }
  }
}

class UpdateUserInfoValidator extends PositiveIdValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须是正整数", {
      min: 1
    });
    this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱");
  }
}

class UpdateGroupValidator extends PositiveIdValidator {
  constructor () {
    super();
    this.name = new Rule("isNotEmpty", "请输入分组名称");
    this.info = new Rule("isOptional");
  }
}

class RemoveAuthsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须正整数");
    this.auths = new Rule("isNotEmpty", "请输入auths字段");
  }

  validateAuths (data) {
    const auths = data.body.auths;
    if (!Array.isArray(auths)) {
      return [false, "auths必须为非空数组"];
    }
    for (const auth of auths) {
      if (!isNotEmpty(auth)) {
        return [false, "auths必须为非空数组"];
      }
    }
    return true;
  }
}

class DispatchAuthsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须正整数");
    this.auths = new Rule("isNotEmpty", "请输入auths字段");
  }

  validateAuths (data) {
    const auths = data.body.auths;
    if (!Array.isArray(auths)) {
      return [false, "auths必须为非空数组"];
    }
    for (const auth of auths) {
      if (!isNotEmpty(auth)) {
        return [false, "auths必须为非空数组"];
      }
    }
    return true;
  }
}

class NewGroupValidator extends LinValidator {
  constructor () {
    super();
    this.name = new Rule("isNotEmpty", "请输入分组名称");
    this.info = new Rule("isOptional");
    this.auths = new Rule("isNotEmpty", "请输入auths字段");
  }

  validateAuths (data) {
    const auths = data.body.auths;
    if (!Array.isArray(auths)) {
      return [false, "auths必须为非空数组"];
    }
    for (const auth of auths) {
      if (!isNotEmpty(auth)) {
        return [false, "auths必须为非空数组"];
      }
    }
    return true;
  }
}

class DispatchAuthValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须正整数");
    this.auth = new Rule("isNotEmpty", "请输入auth字段");
  }
}

module.exports = {
  UpdateGroupValidator,
  UpdateUserInfoValidator,
  DispatchAuthValidator,
  NewGroupValidator,
  DispatchAuthsValidator,
  RemoveAuthsValidator,
  ResetPasswordValidator,
  AdminUsersValidator
};
