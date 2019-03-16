const { config } = require("lin-cms/lin/config");

// 初始化数据库配置
(() => {
  const settings = require("../../app/config/setting");
  const secure = require("../../app/config/secure");
  config.getConfigFromObj({
    ...settings,
    ...secure
  });
})();
