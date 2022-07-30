import { LinRouter } from "lin-mizar";
import { ContentService } from "../../service/content";
import { AddContentValidator } from "../../validators/content";

const contentApi = new LinRouter({
    prefix: '/v1/content',
})


contentApi.post('/', async ctx => {
    // 1. 参数校验
    const v = await new AddContentValidator().validate(ctx)
    // 2. 执行业务逻辑
    // 3. 插入数据库
    await ContentService.addContent(v.get('body'))
    // 4. 返回成功
    ctx.success({
        msg: '期刊内容新增成功'
    })
})

contentApi.get('/', async ctx => {
    const contentList = await ContentService.getContentList()
    ctx.json(contentList)
})


module.exports = { contentApi }