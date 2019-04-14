require("../helper/initial");
const request = require("supertest");
const { createApp } = require("../../app/app");
const { db } = require("lin-mizar/lin/db");
const { getToken } = require("../helper/token");

describe("user3.test.js", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("测试/cms/user/ 用户更新自己信息，邮箱不符合规范", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/user/")
      .auth(token, {
        type: "bearer"
      })
      .send({
        email: "pedro"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/ 用户更新自己信息成功", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/user/")
      .auth(token, {
        type: "bearer"
      })
      .send({
        email: "gaopedro@163.com"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/change_password 用户修改密码，不输入旧密码", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/user/change_password")
      .auth(token, {
        type: "bearer"
      })
      .send({
        new_password: "147258",
        confirm_password: "147258",
        old_password: ""
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/change_password 用户修改密码，不输入确认密码", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/user/change_password")
      .auth(token, {
        type: "bearer"
      })
      .send({
        new_password: "147258",
        confirm_password: "",
        old_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/change_password 用户修改密码成功", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/user/change_password")
      .auth(token, {
        type: "bearer"
      })
      .send({
        new_password: "123456",
        confirm_password: "123456",
        old_password: "147258"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/refresh 用户刷新token", async () => {
    const token = getToken("refresh_token");
    const response = await request(app.callback())
      .get("/cms/user/refresh")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/auths 用户权限", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .get("/cms/user/auths")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });
});
