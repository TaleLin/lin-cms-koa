"use strict";

const { LinValidator, Rule } = require("lin-mizar");
const validator = require("validator");

class EventsValidator extends LinValidator {
  constructor () {
    super();
    this.group_id = new Rule("isInt", "分组id必须为正整数");
    this.events = new Rule("isNotEmpty", "请输入events字段");
  }
}

class IdsValidator extends LinValidator {
  constructor () {
    super();
    this.ids = new Rule("isNotEmpty", "每个id值必须为正整数");
  }

  validateIds (data) {
    const ids = data.body.ids;
    if (!Array.isArray(ids)) {
      return [false, "每个id值必须为正整数"];
    }
    for (let id of ids) {
      if (typeof id === "number") {
        id = String(id);
      }
      if (!validator.isInt(id, { min: 1 })) {
        return [false, "每个id值必须为正整数"];
      }
    }
    return true;
  }
}

module.exports = { IdsValidator, EventsValidator };
