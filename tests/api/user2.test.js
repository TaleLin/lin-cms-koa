require("../helper/initial");
const request = require("supertest");
const { createApp } = require("../../app/app");
const { db } = require("lin-mizar/lin/db");
const { saveTokens } = require("../helper/token");

describe("user2.test.js", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("测试/cms/user/login 登陆，用户名不存在", async () => {
    const response = await request(app.callback())
      .post("/cms/user/login")
      .send({
        nickname: "llllll",
        password: "123456"
      });
    expect(response.status).toBe(404);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/login 登陆，密码错误", async () => {
    const response = await request(app.callback())
      .post("/cms/user/login")
      .send({
        nickname: "pedro",
        password: "147258"
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error_code", 10000);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/login 登陆成功", async () => {
    const response = await request(app.callback())
      .post("/cms/user/login")
      .send({
        nickname: "super",
        password: "123456"
      });
    saveTokens(response.body);
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });
});
