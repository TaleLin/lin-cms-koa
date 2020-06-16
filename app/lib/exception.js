import { HttpException, config } from 'lin-mizar';

const CodeMessage = config.getItem('codeMessage', {});

/**
 * 自定义异常类
 */
class BookNotFound extends HttpException {
  constructor (ex) {
    super();
    this.status = 404;
    this.code = 10022;
    this.message = CodeMessage.getMessage(10022);
    this.exceptionHandler(ex);
  }
}

export { BookNotFound };
