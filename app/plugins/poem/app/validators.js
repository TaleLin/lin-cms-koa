import { LinValidator, Rule } from 'lin-mizar';

class PoemListValidator extends LinValidator {
  constructor () {
    super();
    this.count = [
      new Rule('isOptional'),
      new Rule('isInt', '必须在1~100之间取值', { min: 1, max: 100 })
    ];
    this.author = new Rule('isOptional');
  }
}

class PoemSearchValidator extends LinValidator {
  constructor () {
    super();
    this.q = new Rule('isNotEmpty', '必须传入搜索关键字');
  }
}

export { PoemListValidator, PoemSearchValidator };
