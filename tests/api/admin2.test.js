require("../helper/initial");
const request = require("supertest");
const { createApp } = require("../../app/app");
const { db } = require("lin-mizar/lin/db");
const { getToken } = require("../helper/token");

describe("admin2.test.js", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("测试/cms/admin/group 新建权限组，不输入名称", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post("/cms/admin/group")
      .auth(token, {
        type: "bearer"
      })
      .send({
        name: "",
        info: "pedro's group",
        auths: ["查看lin的信息"]
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group 新建权限组，不输入auths", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post("/cms/admin/group")
      .auth(token, {
        type: "bearer"
      })
      .send({
        name: "shhhhh",
        info: "pedro's group"
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group 新建权限组，输入auths为 []", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .post("/cms/admin/group")
      .auth(token, {
        type: "bearer"
      })
      .send({
        name: "llll",
        info: "pedro's group",
        auths: []
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group 更新权限组失败", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/admin/group/16")
      .auth(token, {
        type: "bearer"
      })
      .send({
        name: "",
        info: "peter's group",
        auths: []
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error_code", 10030);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group 更新权限组成功", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .put("/cms/admin/group/16")
      .auth(token, {
        type: "bearer"
      })
      .send({
        name: "llll",
        info: "peter's group",
        auths: ["hello", "消息推送"]
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });

  test("测试/cms/admin/group 删除权限组", async () => {
    const token = getToken();
    const response = await request(app.callback())
      .delete("/cms/admin/group/16")
      .auth(token, {
        type: "bearer"
      });
    expect(response.status).toBe(201);
    expect(response.type).toMatch(/json/);
  });
});
