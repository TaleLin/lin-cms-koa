require('./initial');
const { db } = require('lin-mizar/lin/db');
const { User, UserAdmin } = require('lin-mizar/lin');
const { UserInterface } = require('lin-mizar/lin/interface');
const lodash = require('lodash');

const run = async () => {
  await User.init(
    { ...UserInterface.attributes },
    lodash.merge(
      {
        sequelize: db,
        tableName: 'lin_user',
        modelName: 'user'
      },
      UserInterface.options
    )
  );
  // 创建super
  try {
    await User.create({
      username: 'super',
      admin: UserAdmin.ADMIN,
      password: '123456'
    });
  } catch (error) {
    console.log(error);
  }
  db.close();
};

run();
