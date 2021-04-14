'use strict';

module.exports = {
  socket: {
    path: '/ws/message',
    enable: false, // 是否开启 websocket 模块
    intercept: false, // 是否开启 websocket 的鉴权拦截器
  }
};