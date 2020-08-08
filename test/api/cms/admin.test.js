import '../../helper/initial';
import request from 'supertest';
import { generate } from 'lin-mizar';
import { createApp } from '../../../app/app';
import { IdentityType } from '../../../app/lib/type';
import sequelize from '../../../app/lib/db';
import { saveTokens, getToken } from '../../helper/token';
import { get, isNumber, isArray } from 'lodash';

describe('/cms/admin', () => {
  const { UserModel, UserIdentityModel } = require('../../../app/model/user');
  const { GroupModel } = require('../../../app/model/group');
  const {
    GroupPermissionModel
  } = require('../../../app/model/group-permission');
  const { UserGroupModel } = require('../../../app/model/user-group');
  const { PermissionModel } = require('../../../app/model/permission');

  let app;

  let token;

  beforeAll(async done => {
    console.log('start admin');
    // 初始化 app
    app = await createApp();
    done();
  });

  afterAll(async done => {
    setTimeout(async () => {
      await sequelize.close();
      done();
    }, 500);
  });

  beforeEach(async done => {
    await sequelize.sync({ force: true });
    await UserModel.create({ username: 'root', nickname: 'root' });
    await UserIdentityModel.create({
      user_id: 1,
      identity_type: IdentityType.Password,
      identifier: 'root',
      credential: 'sha1$c419e500$1$84869e5560ebf3de26b6690386484929456d6c07'
    });
    await GroupModel.create({ name: 'root', info: '超级用户组', level: 1 });
    await GroupModel.create({ name: 'guest', info: '游客组', level: 2 });
    await UserGroupModel.create({ user_id: 1, group_id: 1 });
    done();
  });

  it('超级管理员登录', async () => {
    const response = await request(app.callback())
      .post('/cms/user/login')
      .send({
        username: 'root',
        password: '123456'
      });
    saveTokens(response.body);
    token = getToken();
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  it('查询所有可分配的权限', async () => {
    await PermissionModel.create({ name: '查看信息', module: '信息' });

    const response = await request(app.callback())
      .get('/cms/admin/permission')
      .auth(token, {
        type: 'bearer'
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    const is = isArray(get(response, 'body.信息'));
    expect(is).toBeTruthy();
  });

  it('查询所有用户', async () => {
    const response = await request(app.callback())
      .get('/cms/admin/users')
      .auth(token, {
        type: 'bearer'
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.count')).toBe(10);
    const is = isNumber(get(response, 'body.total'));
    expect(is).toBeTruthy();
  });

  it('插入用户信息、分组、权限，查询所有用户', async () => {
    const user = await UserModel.create({
      username: 'shirmy',
      email: 'shirmy@gmail.com'
    });
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    await UserGroupModel.create({ group_id: group.id, user_id: user.id });

    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });

    const response = await request(app.callback())
      .get('/cms/admin/users')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        group_id: group.id
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.count')).toBe(10);
    const is = isNumber(get(response, 'body.total'));
    expect(is).toBeTruthy();
  });

  it('修改用户密码', async () => {
    const user = await UserModel.create({
      username: 'shirmy',
      email: 'shirmy@gmail.com'
    });
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    await UserGroupModel.create({ group_id: group.id, user_id: user.id });
    await UserIdentityModel.create({
      user_id: user.id,
      identity_type: IdentityType.Password,
      identifier: user.username,
      credential: generate('123456')
    });

    const newPassword = '654321';

    const response = await request(app.callback())
      .put(`/cms/admin/user/${user.id}/password`)
      .auth(token, {
        type: 'bearer'
      })
      .send({
        new_password: newPassword,
        confirm_password: newPassword
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(4);
    expect(get(response, 'body.message')).toBe('密码修改成功');
  });

  it('删除用户', async () => {
    const user = await UserModel.create({
      username: 'shirmy',
      email: 'shirmy@gmail.com'
    });
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    await UserGroupModel.create({ group_id: group.id, user_id: user.id });

    const response = await request(app.callback())
      .delete(`/cms/admin/user/${user.id}`)
      .auth(token, {
        type: 'bearer'
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(5);
    expect(get(response, 'body.message')).toBe('删除用户成功');
  });

  it('更新用户', async () => {
    const user = await UserModel.create({
      username: 'shirmy',
      email: 'shirmy@gmail.com'
    });
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    await UserGroupModel.create({ group_id: group.id, user_id: user.id });

    const response = await request(app.callback())
      .put(`/cms/admin/user/${user.id}`)
      .auth(token, { type: 'bearer' })
      .send({
        group_ids: [group.id]
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(6);
    expect(get(response, 'body.message')).toBe('更新用户成功');
  });

  it('查询所有权限组及其权限', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });

    const response = await request(app.callback())
      .get('/cms/admin/group')
      .auth(token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.count')).toBe(10);
    const is = isNumber(get(response, 'body.total'));
    expect(is).toBeTruthy();
  });

  it('查询所有权限组', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });

    const response = await request(app.callback())
      .get('/cms/admin/group/all')
      .auth(token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    const is = isArray(get(response, 'body'));
    expect(is).toBeTruthy();
  });

  it('查询一个权限组及其权限', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });

    const response = await request(app.callback())
      .get(`/cms/admin/group/${group.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.name')).toBe(group.name);
    const hasPermission = !!get(response, 'body.permissions').find(
      v => v.id === permission.id
    );
    expect(hasPermission).toBeTruthy();
  });

  it('新建权限组', async () => {
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });

    const response = await request(app.callback())
      .post('/cms/admin/group')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'new group name',
        info: 'new group info',
        permission_ids: [permission.id]
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(15);
    expect(get(response, 'body.message')).toBe('新建分组成功');
  });

  it('更新一个权限组', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });

    const response = await request(app.callback())
      .put(`/cms/admin/group/${group.id}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'new group name',
        info: 'new group info'
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(7);
    expect(get(response, 'body.message')).toBe('更新分组成功');

    const newGroup = await GroupModel.findByPk(group.id);
    expect(newGroup.name).toBe('new group name');
  });

  it('删除一个权限组', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });

    const response = await request(app.callback())
      .delete(`/cms/admin/group/${group.id}`)
      .auth(token, { type: 'bearer' });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(8);
    expect(get(response, 'body.message')).toBe('删除分组成功');
  });

  it('分配单个权限', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });

    const response = await request(app.callback())
      .post('/cms/admin/permission/dispatch')
      .auth(token, { type: 'bearer' })
      .send({
        group_id: group.id,
        permission_id: permission.id
      });

    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(9);
    expect(get(response, 'body.message')).toBe('添加权限成功');
  });

  it('分配多个权限', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    const permission1 = await PermissionModel.create({
      name: '查看研发组的信息',
      module: '信息'
    });

    const response = await request(app.callback())
      .post('/cms/admin/permission/dispatch/batch')
      .auth(token, { type: 'bearer' })
      .send({
        group_id: group.id,
        permission_ids: [permission.id, permission1.id]
      });

    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(9);
    expect(get(response, 'body.message')).toBe('添加权限成功');
  });

  it('删除多个权限', async () => {
    const group = await GroupModel.create({ name: '研发组', info: '研发大佬' });
    const permission = await PermissionModel.create({
      name: '查看信息',
      module: '信息'
    });
    const permission1 = await PermissionModel.create({
      name: '查看研发组的信息',
      module: '信息'
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission.id
    });
    await GroupPermissionModel.create({
      group_id: group.id,
      permission_id: permission1.id
    });

    const response = await request(app.callback())
      .post('/cms/admin/permission/remove')
      .auth(token, { type: 'bearer' })
      .send({
        group_id: group.id,
        permission_ids: [permission.id, permission1.id]
      });

    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
    expect(get(response, 'body.code')).toBe(10);
    expect(get(response, 'body.message')).toBe('删除权限成功');
  });
});
