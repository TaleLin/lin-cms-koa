import { FlowModel } from "../models/flow";

class Flow {

    static async createFlow(v) {
       const res = await FlowModel.create({
            index: v.get('body.index'),
            type: v.get('body.type'),
            art_id: v.get('body.art_id'),
            status: v.get('body.status'),
       })

       return res
    }

    static async getFlowList() {
        return await FlowModel.findAll({
            order: ['index']
        })
    }

}

export { Flow as FlowDao }