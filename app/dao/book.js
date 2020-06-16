import { NotFound, Forbidden } from 'lin-mizar';
import Sequelize from 'sequelize';
import { Book } from '../model/book';

class BookDao {
  async getBook (id) {
    const book = await Book.findOne({
      where: {
        id
      }
    });
    return book;
  }

  async getBookByKeyword (q) {
    const book = await Book.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        }
      }
    });
    return book;
  }

  async getBooks () {
    const books = await Book.findAll();
    return books;
  }

  async createBook (v) {
    const book = await Book.findOne({
      where: {
        title: v.get('body.title')
      }
    });
    if (book) {
      throw new Forbidden({
        code: 10240
      });
    }
    const bk = new Book();
    bk.title = v.get('body.title');
    bk.author = v.get('body.author');
    bk.summary = v.get('body.summary');
    bk.image = v.get('body.image');
    await bk.save();
  }

  async updateBook (v, id) {
    const book = await Book.findByPk(id);
    if (!book) {
      throw new NotFound({
        code: 10022
      });
    }
    book.title = v.get('body.title');
    book.author = v.get('body.author');
    book.summary = v.get('body.summary');
    book.image = v.get('body.image');
    await book.save();
  }

  async deleteBook (id) {
    const book = await Book.findOne({
      where: {
        id
      }
    });
    if (!book) {
      throw new NotFound({
        code: 10022
      });
    }
    book.destroy();
  }
}

export { BookDao };
