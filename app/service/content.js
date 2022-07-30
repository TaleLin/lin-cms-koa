import { NotFound } from "lin-mizar"
import { MovieDao } from "../dao/movie"
import { MusicDao } from "../dao/music"
import { SentenceDao } from "../dao/sentence"

class Content {

    static async getContentList(v) {
        const movieList = await MovieDao.getMovieList()
        const musicList = await MusicDao.getMusicList()
        const sentenceList = await SentenceDao.getSentenceList()

        let res = []
        res.push.apply(res, movieList)
        res.push.apply(res, musicList)
        res.push.apply(res, sentenceList)

        res.sort((a, b) => b.created_at.localeCompare(a.created_at))
        return res
    }

    static async addContent(v) {
        switch (v['type']) {
            case 100:
                // TODO 电影
                delete v['url']
                await MovieDao.addMovie(v)
                break
            case 200:
                // TODO 音乐
                await MusicDao.addMusic(v)
                break
            case 300:
                // TODO 句子
                delete v['url']
                await SentenceDao.addSentence(v)
                break
            default:
                throw new NotFound({ msg: '内容类型不存在' })
        }
    }
}

export { Content as ContentService }