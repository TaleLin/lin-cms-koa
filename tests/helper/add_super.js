require('./initial');
const { db } = require('lin-mizar/lin/db');
const { User, UserAdmin } = require('lin-mizar/lin');

const run = async () => {
  try {
    await User.create({
      nickname: 'super',
      admin: UserAdmin.ADMIN,
      password: '123456'
    });
  } catch (error) {
    console.log(error);
  }
  db.close();
};

run();
