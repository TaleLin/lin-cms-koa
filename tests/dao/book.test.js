require("../helper/initial");
const { BookDao } = require("../../app/api/v1/book");
// const { CreateOrUpdateBookValidator } = require("../../app/validators/cms");
const { db } = require("lin-mizar/lin/db");

describe("book.test.js", () => {
  /**
   * @type BookDao
   */
  let bookDao;

  beforeAll(async () => {
    bookDao = new BookDao();
  });

  afterAll(() => {
    setTimeout(() => {
      db.close();
    }, 500);
  });

  test("获取一本书", async () => {
    const book = await bookDao.getBook(1);
    expect(book).not.toBe(undefined);
  });

  // test("创建书籍", async () => {
  //   // const ctx = context({
  //   //   url: "",
  //   //   body: {}
  //   // });
  //   const form = new CreateOrUpdateBookValidator();
  //   form.data.title = "平凡的程序";
  //   form.data.author = "pedro";
  //   form.data.summary = "~~~~~~~~~~~~~~~~~~~~~~~~~ a book";
  //   form.data.image = "$$$$$$$$$$$$$$$$$$$$$";
  //   await bookDao.createBook(form);
  // });

  test("搜索一本书", async () => {
    const book = await bookDao.getBookByKeyword("koa");
    expect(book).not.toBe(undefined);
  });

  test("获取所有书", async () => {
    const books = await bookDao.getBooks();
    expect(books).not.toBe(undefined);
  });

  test("删除书籍", async () => {
    await bookDao.deleteBook(1);
  });
});
