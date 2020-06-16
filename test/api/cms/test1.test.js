import '../../helper/initial';
import request from 'supertest';
import { createApp } from '../../../app/app';
import sequelize from '../../../app/lib/db';

describe('test1.test.js', () => {
  // 必须，app示例
  let app;

  beforeAll(async () => {
    // 初始化app示例
    app = await createApp();
  });

  afterAll(() => {
    // 最后关闭数据库
    setTimeout(() => {
      sequelize.close();
    }, 500);
  });

  // 测试 api 的函数
  // 测试 api的 URL 为 /cms/test/
  test('测试/cms/test/', async () => {
    const response = await request(app.callback()).get('/cms/test/');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });

  // 这个测试不会通过，缺少认证，可以参考 user2.test.js 添加 bearer
  test('测试/cms/user/register 输入不规范用户名', async () => {
    const response = await request(app.callback())
      .post('/cms/user/register')
      .send({
        username: 'p',
        password: '123456',
        confirm_password: '123456'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 10030);
    expect(response.type).toMatch(/json/);
  });
});
