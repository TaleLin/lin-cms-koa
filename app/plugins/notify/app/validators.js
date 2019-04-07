"use strict";
const { LinValidator, Rule } = require("lin-mizar");

const { extendedValidator } = require("lin-mizar/lin/extended-validator");

class EventsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须为正整数");
    this.events = new Rule("isNotEmpty", "请输入events字段");
  }
}

exports.EventsValidator = EventsValidator;

class IdsValidator extends LinValidator {
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
