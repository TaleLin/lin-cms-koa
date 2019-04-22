"use strict";

const Router = require("koa-router");
const { PoemListValidator, PoemSearchValidator } = require("./validators");
const { Poem } = require("./model");

const api = new Router({ prefix: "/poem" });

api.get("/all", async ctx => {
  const validator = await new PoemListValidator().validate(ctx);
  const poems = await Poem.getAll(validator);
  ctx.json(poems);
});

api.get("/search", async ctx => {
  const validator = await new PoemSearchValidator().validate(ctx);
  const poems = await Poem.search(validator.get("query.q"));
  ctx.json(poems);
});

api.get("/authors", async ctx => {
  const authors = await Poem.getAuthors();
  ctx.json(authors);
});

module.exports = { api };
