import { LinRouter, NotFound, disableLoading } from 'lin-mizar';
import { groupRequired } from '../../middleware/jwt';
import {
  BookSearchValidator,
  CreateOrUpdateBookValidator
} from '../../validator/book';
import { PositiveIdValidator } from '../../validator/common';

import { getSafeParamId } from '../../lib/util';
import { BookNotFound } from '../../lib/exception';
import { BookDao } from '../../dao/book';

// book 的红图实例
const bookApi = new LinRouter({
  prefix: '/v1/book',
  module: '图书'
});

// book 的dao 数据库访问层实例
const bookDto = new BookDao();

bookApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const book = await bookDto.getBook(id);
  if (!book) {
    throw new NotFound({
      code: 10022
    });
  }
  ctx.json(book);
});

bookApi.get('/', async ctx => {
  const books = await bookDto.getBooks();
  // if (!books || books.length < 1) {
  //   throw new NotFound({
  //     message: '没有找到相关书籍'
  //   });
  // }
  ctx.json(books);
});

bookApi.get('/search/one', async ctx => {
  const v = await new BookSearchValidator().validate(ctx);
  const book = await bookDto.getBookByKeyword(v.get('query.q'));
  if (!book) {
    throw new BookNotFound();
  }
  ctx.json(book);
});

bookApi.post('/', async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  await bookDto.createBook(v);
  ctx.success({
    code: 12
  });
});

bookApi.put('/:id', async ctx => {
  const v = await new CreateOrUpdateBookValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await bookDto.updateBook(v, id);
  ctx.success({
    code: 13
  });
});

bookApi.linDelete(
  'deleteBook',
  '/:id',
  bookApi.permission('删除图书'),
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await bookDto.deleteBook(id);
    ctx.success({
      code: 14
    });
  }
);

module.exports = { bookApi, [disableLoading]: false };
