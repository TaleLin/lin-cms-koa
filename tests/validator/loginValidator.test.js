const { LoginValidator } = require("../../app/validators/cms");
const context = require("../helper/context");
const { ParametersException } = require("lin-mizar");

describe("loginValidator.test.js", () => {
  test("登陆校验", async () => {
    const ctx = context({
      url: "/"
    });
    ctx.request.body = {
      nickname: "pedro",
      password: "123456"
    };
    const v = await new LoginValidator().validate(ctx);
    expect(v.get("nickname")).toBe("pedro");
  });

  test("登陆校验别名", async () => {
    const ctx = context({
      url: "/"
    });
    ctx.request.body = {
      name: "pedro",
      password: "123456"
    };
    const v = await new LoginValidator().validate(ctx, {
      nickname: "name"
    });
    expect(v.get("name")).toBe("pedro");
  });

  test("登陆校验失败", async () => {
    const ctx = context({
      url: "/"
    });
    ctx.request.body = {
      nickname: "pedro"
    };
    try {
      await new LoginValidator().validate(ctx);
    } catch (err) {
      console.log(err);
      expect(err).toBeInstanceOf(ParametersException);
    }
  });
});
