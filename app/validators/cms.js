"use strict";

const { ClassValidator, Rule, checkDateFormat } = require("lin-cms");
const { extendedValidator } = require("lin-cms/lin/extended-validator");

exports.RegisterValidator = class extends ClassValidator {
  constructor () {
    super();
    this.nickname = [
      new Rule("isNotEmpty", "昵称不可为空"),
      new Rule("length", "昵称长度必须在2~10之间", 2, 10)
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
    if (!this.data.password || !this.data.confirm_password) {
      return false;
    }
    let ok = this.data.password === this.data.confirm_password;
    return ok;
  }
};

class LoginValidator extends ClassValidator {
  constructor () {
    super();
    this.nickname = new Rule("isNotEmpty", "昵称不可为空");
    this.password = new Rule("isNotEmpty", "密码不可为空");
  }
}

exports.LoginValidator = LoginValidator;

/**
 * 用户更新自己的邮箱
 */
class UpdateInfoValidator extends ClassValidator {
  constructor () {
    super();
    this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱");
  }
}
exports.UpdateInfoValidator = UpdateInfoValidator;

class ResetPasswordValidator extends ClassValidator {
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
    if (!this.data.new_password || !this.data.confirm_password) {
      return false;
    }
    return this.data.new_password === this.data.confirm_password;
  }
}

exports.ResetPasswordValidator = ResetPasswordValidator;

class ChangePasswordValidator extends ClassValidator {
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
    if (!this.data.new_password || !this.data.confirm_password) {
      return false;
    }
    return this.data.new_password === this.data.confirm_password;
  }
}

exports.ChangePasswordValidator = ChangePasswordValidator;

class LogFindValidator extends ClassValidator {
  constructor () {
    super();
    this.name = new Rule("isOptional");
    this.start = [
      new Rule("isOptional"),
      new Rule(checkDateFormat, "请输入正确格式开始时间")
    ];
    this.end = [
      new Rule("isOptional"),
      new Rule(checkDateFormat, "请输入正确格式开始时间")
    ];
  }
}

exports.LogFindValidator = LogFindValidator;

class UpdateUserInfoValidator extends ClassValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须是正整数", {
      min: 1
    });
    this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱");
  }
}

exports.UpdateUserInfoValidator = UpdateUserInfoValidator;

class NewGroupValidator extends ClassValidator {
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

exports.NewGroupValidator = NewGroupValidator;

class UpdateGroupValidator extends ClassValidator {
  constructor () {
    super();
    this.name = new Rule("isNotEmpty", "请输入分组名称");
    this.info = new Rule("isOptional", "");
  }
}

exports.UpdateGroupValidator = UpdateGroupValidator;

class DispatchAuthValidator extends ClassValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须正整数");
    this.auth = new Rule("isNotEmpty", "请输入auth字段");
  }
}

exports.DispatchAuthValidator = DispatchAuthValidator;

class DispatchAuthsValidator extends ClassValidator {
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

exports.DispatchAuthsValidator = DispatchAuthsValidator;

class RemoveAuthsValidator extends ClassValidator {
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

exports.RemoveAuthsValidator = RemoveAuthsValidator;

class BookSearchValidator extends ClassValidator {
  constructor () {
    super();
    this.q = new Rule("isNotEmpty", "必须传入搜索关键字");
  }
}
exports.BookSearchValidator = BookSearchValidator;

class CreateOrUpdateBookValidator extends ClassValidator {
  constructor () {
    super();
    this.title = new Rule("isNotEmpty", "必须传入图书名");
    this.author = new Rule("isNotEmpty", "必须传入图书作者");
    this.summary = new Rule("isNotEmpty", "必须传入图书综述");
    this.image = new Rule("isNotEmpty", "必须传入图书插图");
  }
}

exports.CreateOrUpdateBookValidator = CreateOrUpdateBookValidator;
