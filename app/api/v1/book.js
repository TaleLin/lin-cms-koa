"use strict";

const {
  LinRouter,
  NotFound,
  groupRequired,
  disableLoading
} = require("lin-mizar");
const { getSafeParamId } = require("../../libs/util");
const {
  BookSearchValidator,
  CreateOrUpdateBookValidator
} = require("../../validators/book");

const { PositiveIdValidator } = require("../../validators/common");

const { BookNotFound } = require("../../libs/err-code");
const { Book } = require("../../models/book");
const { BookDao } = require("../../dao/book");

// book 的红图实例
const bookApi = new LinRouter({
  prefix: "/v1/book"
});

// book 的dao 数据库访问层实例
const bookDto = new BookDao();

bookApi.get("/:id", async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get("path.id");
  const book = await bookDto.getBook(id);
  if (!book) {
    throw new NotFound({
      msg: "没有找到相关书籍"
    });
  }
  ctx.json(book);
});

bookApi.get("/", async ctx => {
  const books = await bookDto.getBooks();
  if (!books || books.length < 1) {
    throw new NotFound({
      msg: "没有找到相关书籍"
    });
  }
  ctx.json(books);
});

bookApi.get("/search/one", async ctx => {
  const v = await new BookSearchValidator().validate(ctx);
  const book = await bookDto.getBookByKeyword(v.get("query.q"));
  if (!book) {
    throw new BookNotFound();
  }
  ctx.json(book);
});

bookApi.post("/", async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  await bookDto.createBook(v);
  ctx.success({
    msg: "新建图书成功"
  });
});

bookApi.put("/:id", async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await bookDto.updateBook(v, id);
  ctx.success({
    msg: "更新图书成功"
  });
});

bookApi.linDelete(
  "deleteBook",
  "/:id",
  {
    auth: "删除图书",
    module: "图书",
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get("path.id");
    await bookDto.deleteBook(id);
    ctx.success({
      msg: "删除图书成功"
    });
  }
);

bookApi.get("/", async ctx => {
  const books = await Book.findAll();
  if (books.length < 1) {
    throw new NotFound({
      msg: "没有找到相关书籍"
    });
  }
  ctx.json(books);
});

module.exports = { bookApi, [disableLoading]: false };
