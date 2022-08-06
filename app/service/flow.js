import { FlowDao } from "../dao/flow"
import { MusicDao } from "../dao/music";
import { MovieModel } from "../models/movie";

class Flow {

    static async getFlowList() {
        const flowList = await FlowDao.getFlowList();
        
        if (flowList.length === 0) {
            return flowList
        }

        const newFlowList = []

        for (let i = 0; i < flowList.length; i++) {
            let detail

            switch (flowList[i].type) {
                case 100:
                    // 电影
                    detail = await MovieModel.findByPk(flowList[i].art_id)
                    break
                case 200:
                    // 音乐
                    detail = await MusicDao.findByPk(flowList[i].art_id)
                    break
                case 300:
                    // 句子
                    detail = await SentenceDao.findByPk(flowList[i].art_id)
                    break
                default:
                    throw new NotFound({ msg: '内容类型不存在' })
            }

            flowList[i].setDataValue('detail', detail)
            newFlowList.push(flowList[i])
        }

        return newFlowList
    }

}

export { Flow as FlowService }