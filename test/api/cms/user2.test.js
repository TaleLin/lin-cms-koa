import '../../helper/initial';
import request from 'supertest';
import { createApp } from '../../../app/app';
import sequelize from '../../../app/lib/db';
import { getToken } from '../../helper/token';

describe('user2.test.js', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      sequelize.close();
    }, 500);
  });

  test('测试/cms/user/register 不输入邮箱，重复密码错误', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'pedro',
        password: '123456',
        confirm_password: '123455'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10030);
    expect(response.type).toMatch(/json/);
  });

  test('测试/cms/user/register 输入不正确邮箱', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'pedro',
        email: '8680909709j',
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10030);
    expect(response.type).toMatch(/json/);
  });

  test('测试/cms/user/register 输入不规范用户名', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'p',
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10030);
    expect(response.type).toMatch(/json/);
  });

  test('测试/cms/user/register 输入不规范分组id', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'pedro',
        group_ids: 0,
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10030);
    expect(response.type).toMatch(/json/);
  });

  // test('测试/cms/user/register 正常注册', async () => {
  //   const token = getToken()
  //   const response = await request(app.callback())
  //     .post('/cms/user/register')
  //     .auth(token, {
  //       type: 'bearer'
  //     })
  //     .send({
  //       username: 'peter',
  //       email: '123456@gmail.com',
  //       group_ids: [],
  //       password: '123456',
  //       confirm_password: '123456',
  //     });
  //   expect(response.status).toBe(201);
  //   expect(response.type).toMatch(/json/);
  // });

  test('测试/cms/user/register 用户名重复错误', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'peter',
        email: '654321@gmail.com',
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10071);
    expect(response.type).toMatch(/json/);
  });

  test('测试/cms/user/register 邮箱重复错误', async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post('/cms/user/register')
      .auth(token, {
        type: 'bearer'
      })
      .send({
        username: 'ooooo',
        email: '123456@gmail.com',
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10076);
    expect(response.type).toMatch(/json/);
  });
});
