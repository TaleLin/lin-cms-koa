"use strict";

const { Rule, LinValidator } = require("lin-mizar");
const { extendedValidator } = require("lin-mizar/lin/extended-validator");
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
    this.confirm_password = new Rule(
      this.passwordCheck.bind(this),
      "两次输入密码不一致"
    );
  }

  passwordCheck (val) {
    if (!this.data.body.new_password || !this.data.body.confirm_password) {
      return false;
    }
    return this.data.body.new_password === this.data.body.confirm_password;
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
    this.auths = new Rule(this.checkAuths, "请输入auths字段");
  }
  checkAuths (auths) {
    if (!Array.isArray(auths)) {
      return false;
    }
    for (const auth in auths) {
      if (!extendedValidator.isNotEmpty(auth)) {
        return false;
      }
    }
    return true;
  }
}

class DispatchAuthsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须正整数");
    this.auths = new Rule(this.checkAuths, "请输入auths字段");
  }

  checkAuths (auths) {
    if (!Array.isArray(auths)) {
      return false;
    }
    for (const auth in auths) {
      if (!extendedValidator.isNotEmpty(auth)) {
        return false;
      }
    }
    return true;
  }
}

class NewGroupValidator extends LinValidator {
  constructor () {
    super();
    this.name = new Rule("isNotEmpty", "请输入分组名称");
    this.info = new Rule("isOptional", "");
    this.auths = new Rule(this.checkAuths, "请输入auths字段");
  }

  checkAuths (auths) {
    if (!Array.isArray(auths)) {
      return false;
    }
    if (auths.length === 0) {
      return true;
    }
    for (const auth in auths) {
      if (!extendedValidator.isNotEmpty(auth)) {
        return false;
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
