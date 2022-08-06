import { SentenceModel } from "../models/sentence";

class Sentence {

    static async getSentenceList() {
        return await SentenceModel.findAll()
    }

    static async addSentence(v) {
        return await SentenceModel.create(v)
    }

    static async editSentence(id, params) {
        const sentence = await SentenceModel.findByPk(id)
        if (!sentence) {
            throw new NotFound()
        }

        return await sentence.update({ ...params })
    }

    static async deleteSentenceById(id) {
        return await SentenceModel.destroy({ 
            where: { id },
         })
    }
}

export { Sentence as SentenceDao }