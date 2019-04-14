const { config } = require("lin-mizar/lin/config");

// 初始化数据库配置
(() => {
  const settings = require("../../app/config/setting");
  const secure = require("../../app/config/secure");
  config.getConfigFromObj({
    ...settings,
    ...secure
  });
})();
