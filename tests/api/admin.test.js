require("../helper/initial");
const request = require("supertest");
const { createApp } = require("../../app/app");
const { db } = require("lin-mizar/lin/db");
const { getToken } = require("../helper/token");

describe("admin.test.js", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("测试/cms/admin/ 获得所有权限", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/admin/authority")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/users 获得所有用户", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/admin/users")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/password/:id 修改用户密码", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/admin/password/1")
      .auth(token, {
        type: "bearer"
      })
      .send({
        new_password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/:id 修改用户信息", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/admin/1")
      .auth(token, {
        type: "bearer"
      })
      .send({
        group_id: 1,
        email: "pedro1996@gmail.com"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/:id 删除用户", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .delete("/cms/admin/1")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/groups 查询所有权限组及其权限", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/admin/groups")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group/all 查询所有权限组", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/admin/group/all")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group/:id 查询一个权限组及其权限", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/admin/group/1")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });
});
