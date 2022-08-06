import { LinRouter } from "lin-mizar";
import { FlowDao } from "../../dao/flow";
import { groupRequired } from "../../middleware/jwt";
import { logger } from "../../middleware/logger";
import { FlowService } from "../../service/flow";
import { AddFlowValidator } from "../../validators/flow";

const flowApi = new LinRouter({
    prefix: '/v1/flow',
})

/**
 * 新增期刊内容
 */
flowApi.linPost('addFlow',
'/', 
{
    permission: '新增最新期刊',
    module: '最新期刊管理',
    mount: true,
}, 
groupRequired,
logger("{user.username}新增了最新期刊"),
async ctx => {
    const v = await new AddFlowValidator().validate(ctx)

    await FlowDao.createFlow(v)

    ctx.success({
        msg: '最新期刊内容成功'
    })
})

 flowApi.get('/', async ctx => {
    // 1. flow
    // 2. 根据结果里面的art_id，type字段去查询相应类型的期刊内容
    // 3. 格式化数据
    // 4. 返回数据
    const flowList = await FlowService.getFlowList();
    ctx.json(flowList)
})

module.exports = { flowApi }