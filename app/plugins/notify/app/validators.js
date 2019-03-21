"use strict";
const { ClassValidator, Rule } = require("lin-cms");

const { extendedValidator } = require("lin-cms/lin/extended-validator");

class EventsValidator extends ClassValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须为正整数");
    this.events = new Rule("isNotEmpty", "请输入events字段");
  }
}

exports.EventsValidator = EventsValidator;

class IdsValidator extends ClassValidator {
  constructor () {
    super();
    this.ids = new Rule(this.checkIds, "每个id值必须为正整数");
  }

  checkIds (ids) {
    if (!Array.isArray(ids)) {
      return false;
    }
    for (const id of ids) {
      if (!extendedValidator.isInt2(id)) {
        return false;
      }
    }
    return true;
  }
}

exports.IdsValidator = IdsValidator;
