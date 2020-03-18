import '../initial';
import sequelize from '../../../app/libs/db';
import { generate } from 'lin-mizar';
import { UserModel, UserIdentityModel } from '../../../app/models/user';
import { GroupModel } from '../../../app/models/group';
import { PermissionModel } from '../../../app/models/permission';
import { GroupPermissionModel } from '../../../app/models/group-permission';

const type = 'USERNAME_PASSWORD';

/**
 * 如果创建失败，请确保你的数据库中没有同名的分组和同名的用户
 */
const run = async () => {
  // 创建权限组
  const group = new GroupModel();
  group.name = '普通分组';
  group.info = '就是一个分组而已';
  await group.save();

  // 创建用户
  const user = new UserModel();
  user.username = 'pedro';
  await user.save();

  // 创建用户密码
  await UserIdentityModel.create({
    user_id: user.id,
    identity_type: type,
    identifier: user.username,
    credential: generate('123456')
  });

  // 在运行 app 的时候会获取路由中定义好的权限并插入，这里需要找到 id 来关联权限组
  const permission = await PermissionModel.findOne({
    where: {
      name: '删除图书',
      module: '图书'
    }
  });

  // 关联 permission 权限和 group 权限组
  await GroupPermissionModel.create({
    group_id: group.id,
    permission_id: permission.id
  });

  setTimeout(() => {
    sequelize.close();
  }, 500);
};

run();

// /**
//  * 权限分配，关联用户和权限组
//  */
// import '../initial';
// import sequelize from '../../../app/libs/db';
// import { UserModel } from '../../../app/models/user';
// import { GroupModel } from '../../../app/models/group';
// import { UserGroupModel } from '../../../app/models/user-group';

// const run = async () => {
//   // 查找需要关联的权限组 id
//   const group = await GroupModel.findOne({
//     where: {
//       name: '普通分组'
//     }
//   });

//   // 查找 pedro 用户的 id 用去关联权限组
//   const user = await UserModel.findOne({
//     where: {
//       username: 'pedro'
//     }
//   });

//   // 关联用户和权限组
//   await UserGroupModel.create({
//     user_id: user.id,
//     group_id: group.id
//   });

//   setTimeout(() => {
//     sequelize.close();
//   }, 500);
// };

// run();