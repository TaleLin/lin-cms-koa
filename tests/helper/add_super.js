require("./initial");
const { db } = require("lin-cms/lin/db");
const { User, UserAdmin } = require("lin-cms/lin");

const run = async () => {
  await User.create({
    nickname: "super",
    admin: UserAdmin.ADMIN,
    password: "123456"
  });
  db.close();
};

run();
