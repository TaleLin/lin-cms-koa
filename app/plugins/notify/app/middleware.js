"use strict";

const dayjs = require("dayjs");
const { parseTemplate } = require("lin-mizar");
const { config } = require("lin-mizar/lin/config");
const { MessageBroker } = require("lin-mizar/lin/sse");
const { Message } = require("./model");
const { MessageIsPushed } = require("./enums");

exports.broker = new MessageBroker(config.getItem("notify.retry"));
exports.MESSAGE_EVENTS = new Set();
exports.notify = (template, event, extra) => {
  exports.MESSAGE_EVENTS.add(event);
  return async (ctx, next) => {
    await next();
    pushMessage(template, event, ctx, extra);
  };
};

function pushMessage (template, event, ctx, extra) {
  const message = parseTemplate(
    template,
    ctx.currentUser,
    ctx.response,
    ctx.request
  );
  const now = new Date();
  exports.broker.addMessage(
    event,
    Object.assign(
      {
        message,
        time: dayjs(now).unix()
      },
      extra
    )
  );
  const msg = new Message();
  msg.message = message;
  msg.event = event;
  msg.time = now;
  msg.pushed = MessageIsPushed.PUSHED;
  msg.user_id = ctx.currentUser.id;
  msg.user_name = ctx.currentUser.nickname;
  msg.save();
}
