import { LinValidator } from 'lin-mizar';
import { Rule } from 'lin-mizar/lin';

class AddFlowValidator extends LinValidator {
  constructor () {
    super();
    
    this.index = [
        new Rule('isNotEmpty', '必须指定期刊内容排序'),
        new Rule('isInt', '期刊内容序号必须是数字且大于0', { min: 1})
    ]
    this.type = [
        new Rule('isNotEmpty', '期刊类型不能为空'),
        new Rule('isInt', '期刊内容id必须是数字')
    ]
    this.art_id = [
        new Rule('isNotEmpty', '期刊内容id不能为空'),
        new Rule('isInt', '期刊内容id必须是数字')
    ]
    this.status = [
        new Rule('isNotEmpty', '期刊内容上线状态未指定'),
        new Rule('isInt', '期刊展示状态标识不正确')
    ]
  }
}

export { AddFlowValidator }