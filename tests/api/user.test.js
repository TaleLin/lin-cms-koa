require("../helper/initial");
const request = require("supertest");
const { createApp } = require("../../app/app");
const { db } = require("lin-mizar/lin/db");

describe("user.test.js", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("测试/cms/user/register 不输入邮箱，重复密码错误", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "pedro",
        group_id: 1,
        password: "123456",
        confirm_password: "123455"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 输入不正确邮箱", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "pedro",
        group_id: 1,
        email: "8680909709j",
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 输入不规范用户名", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "p",
        group_id: 1,
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 输入不规范分组id", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "pedro",
        group_id: 0,
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 正常注册", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "peter",
        group_id: 1,
        email: "1312342604@qq.com",
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 用户名重复错误", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "pedro",
        group_id: 1,
        email: "1312342604@qq.com",
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10060);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/user/register 邮箱重复错误", async () => {
    const response = await request(app.callback())
      .post("/cms/user/register")
      .send({
        nickname: "ooooo",
        group_id: 1,
        email: "13123433@qq.com",
        password: "123456",
        confirm_password: "123456"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error_code", 10060);
    expect(response.type).toMatch(/json/);
  });
});
