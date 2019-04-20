"use strict";

exports.countDefault = 10;

exports.pageDefault = 0;

exports.apiDir = "app/api";

exports.accessExp = 60 * 60; // 1h 单位秒

// exports.refreshExp 设置refresh_token的过期时间

// 暂不启用
exports.pluginPath = {
  // plugin name
  // poem: {
  //   // determine a plugin work or not
  //   enable: true,
  //   // path of the plugin that relatived the workdir
  //   path: "app/plugins/poem",
  //   // other config
  //   limit: 2
  // }
  // notify: {
  //   enable: true,
  //   path: "app/plugins/notify",
  //   retry: 2000
  // }
};
