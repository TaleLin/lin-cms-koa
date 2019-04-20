"use strict";

const { NotFound, Forbidden } = require("lin-mizar");
const { Book } = require("../models/book");
const Sequelize = require("sequelize");

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
        title: v.get("body.title"),
        delete_time: null
      }
    });
    if (book) {
      throw new Forbidden({
        msg: "图书已存在"
      });
    }
    const bk = new Book();
    bk.title = v.get("body.title");
    bk.author = v.get("body.author");
    bk.summary = v.get("body.summary");
    bk.image = v.get("body.image");
    bk.save();
  }

  async updateBook (v, id) {
    const book = await Book.findByPk(id);
    if (!book) {
      throw new NotFound({
        msg: "没有找到相关书籍"
      });
    }
    book.title = v.get("body.title");
    book.author = v.get("body.author");
    book.summary = v.get("body.summary");
    book.image = v.get("body.image");
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
    book.destroy();
  }
}

module.exports = { BookDao };
