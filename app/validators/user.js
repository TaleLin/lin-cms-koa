"use strict";

const { LinValidator, Rule } = require("lin-mizar");

class RegisterValidator extends LinValidator {
  constructor () {
    super();
    this.nickname = [
      new Rule("isNotEmpty", "昵称不可为空"),
      new Rule("isLength", "昵称长度必须在2~10之间", 2, 10)
    ];
    this.group_id = new Rule("isInt", "分组id必须是整数，且大于0", {
      min: 1
    });
    this.email = [
      new Rule("isOptional"),
      new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱")
    ];
    this.password = [
      new Rule(
        "matches",
        "密码长度必须在6~22位之间，包含字符、数字和 _ ",
        /^[A-Za-z0-9_*&$#@]{6,22}$/
      )
    ];
    this.confirm_password = [
      new Rule(this.passwordCheck.bind(this), "两次密码输入不一致")
    ];
  }

  passwordCheck (val) {
    if (!this.data.body.password || !this.data.body.confirm_password) {
      return false;
    }
    let ok = this.data.body.password === this.data.body.confirm_password;
    return ok;
  }
}

class LoginValidator extends LinValidator {
  constructor () {
    super();
    this.nickname = new Rule("isNotEmpty", "昵称不可为空");
    this.password = new Rule("isNotEmpty", "密码不可为空");
  }
}

/**
 * 用户更新自己的邮箱
 */
class UpdateInfoValidator extends LinValidator {
  constructor () {
    super();
    this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱");
  }
}

class ChangePasswordValidator extends LinValidator {
  constructor () {
    super();
    this.new_password = new Rule(
      "matches",
      "密码长度必须在6~22位之间，包含字符、数字和 _ "
    );
    this.confirm_password = new Rule(
      this.passwordCheck.bind(this),
      "两次输入密码不一致"
    );
    this.old_password = new Rule("isNotEmpty", "请输入旧密码");
  }

  passwordCheck (val) {
    if (!this.data.body.new_password || !this.data.body.confirm_password) {
      return false;
    }
    return this.data.body.new_password === this.data.body.confirm_password;
  }
}

module.exports = {
  ChangePasswordValidator,
  UpdateInfoValidator,
  LoginValidator,
  RegisterValidator
};
