"use strict";

const { LinRouter, NotFound, Forbidden } = require("lin-mizar");
const { Book } = require("../models/book");
const Sequelize = require("sequelize");
// book 的红图实例
const bookApi = new LinRouter({
  prefix: "/v1/book"
});

exports.bookApi = bookApi;

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
