'use strict';

module.exports = {
  db: {
    database: 'lin-cms',
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    username: 'root',
    password: 'root',
    logging: false,
    timezone: '+08:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    }
  },
  secret:
    '\x88W\xf09\x91\x07\x98\x89\x87\x96\xa0A\xc68\xf9\xecJJU\x17\xc5V\xbe\x8b\xef\xd7\xd8\xd3\xe6\x95*4'
};
