"use strict";

module.exports = {
  countDefault: 10,
  pageDefault: 0,
  apiDir: "app/api",
  accessExp: 60 * 60, // 1h 单位秒
  // debug 模式
  debug: true,
  // refreshExp 设置refresh_token的过期时间
  // 暂不启用插件
  pluginPath: {
    // plugin name
    // poem: {
    //   // determine a plugin work or not
    //   enable: true,
    //   // path of the plugin that relatived the workdir
    //   path: "app/plugins/poem",
    //   // other config
    //   limit: 2
    // },
    // notify: {
    //   enable: true,
    //   path: "app/plugins/notify",
    //   retry: 2000
    // }
  }
};
