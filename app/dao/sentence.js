import { SentenceModel } from "../models/sentence";

class Sentence {

    static async getSentenceList() {
        return await SentenceModel.findAll()
    }

    static async addSentence(v) {
        return await SentenceModel.create(v)
    }
}

export { Sentence as SentenceDao }