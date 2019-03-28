"use strict";

exports.countDefault = 10;

exports.pageDefault = 0;

exports.apiDir = "app/api";

exports.accessExp = 60 * 60; // 1h 单位秒

exports.pluginPath = {
  // plugin name
  // oss: {
  //   // determine a plugin work or not
  //   enable: true,
  //   // path of the plugin that relatived the workdir
  //   path: 'js/app/plugins/oss',
  //   // other config
  //   limit: 100000
  // },
  notify: {
    enable: true,
    path: "app/plugins/notify",
    retry: 2000
  }
};
