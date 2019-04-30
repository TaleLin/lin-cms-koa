require("./initial");
const { db } = require("lin-mizar/lin/db");
// eslint-disable-next-line no-unused-vars
const { User, Group, Auth } = require("lin-mizar/lin");

const run = async () => {
  const group = new Group();

  group.name = "普通分组";
  group.info = "就是一个分组而已";
  await group.save();

  const user = new User();
  user.nickname = "pedro";
  user.password = "123456";
  await user.save();

  await Auth.create({
    auth: "删除图书",
    module: "图书",
    group_id: group.id
  });
  db.close();
};

run();
