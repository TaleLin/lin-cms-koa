"use strict";

const {
  Redprint,
  NotFound,
  Success,
  Forbidden,
  groupRequired
} = require("lin-cms");
const { getSafeParamId } = require("../../libs/util");
const {
  BookSearchValidator,
  CreateOrUpdateBookValidator
} = require("../../validators/cms");
const { BookNotFound } = require("../../libs/errCode");
const { Book } = require("../../models/book");
const Sequelize = require("sequelize");
// book 的红图实例
const bookApi = new Redprint({
  prefix: "/v1/book"
});

exports.bookApi = bookApi;

// exports[disableLoading] = true;

class BookDao {
  async getBook (id) {
    const book = await Book.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    return book;
  }

  async getBookByKeyword (q) {
    const book = await Book.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        },
        delete_time: null
      }
    });
    return book;
  }

  async getBooks () {
    const books = await Book.findAll({
      where: {
        delete_time: null
      }
    });
    return books;
  }
  async createBook (v) {
    const book = await Book.findOne({
      where: {
        title: v.get("title"),
        delete_time: null
      }
    });
    if (book) {
      throw new Forbidden({
        msg: "图书已存在"
      });
    }
    const bk = new Book();
    bk.title = v.get("title");
    bk.author = v.get("author");
    bk.summary = v.get("summary");
    bk.image = v.get("image");
    bk.save();
  }

  async updateBook (v, id) {
    const book = await Book.findById(id);
    if (!book) {
      throw new NotFound({
        msg: "没有找到相关书籍"
      });
    }
    book.title = v.get("title");
    book.author = v.get("author");
    book.summary = v.get("summary");
    book.image = v.get("image");
    book.save();
  }

  async deleteBook (id) {
    const book = await Book.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!book) {
      throw new NotFound({
        msg: "没有找到相关书籍"
      });
    }
    book.softDelete();
  }
}

exports.BookDao = BookDao;

// book 的dao 数据库访问层实例
const bookDto = new BookDao();

bookApi.get("/:id", async ctx => {
  const id = getSafeParamId(ctx);
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
  const book = await bookDto.getBookByKeyword(v.get("q"));
  if (!book) {
    throw new BookNotFound();
  }
  ctx.json(book);
});

bookApi.post("/", async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  await bookDto.createBook(v);
  ctx.json(
    new Success({
      msg: "新建图书成功"
    })
  );
});

bookApi.put("/:id", async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await bookDto.updateBook(v, id);
  ctx.json(
    new Success({
      msg: "更新图书成功"
    })
  );
});

bookApi.redDelete(
  "deleteBook",
  "/:id",
  {
    auth: "删除图书",
    module: "图书",
    mount: true
  },
  groupRequired,
  async ctx => {
    const id = getSafeParamId(ctx);
    await bookDto.deleteBook(id);
    ctx.json(
      new Success({
        msg: "删除图书成功"
      })
    );
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
