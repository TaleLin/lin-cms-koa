import { MusicModel } from "../models/music";

class Music {

    static async getMusicList() {
        return await MusicModel.findAll()
    }

    static async addMusic(v) {
        return await MusicModel.create(v)
    }

    static async editMusic(id, params) {
        const music = await MusicModel.findByPk(id)
        if (!music) {
            throw new NotFound()
        }

        return await music.update({ ...params })
    }

    static async deleteMusicById(id) {
        return await MusicModel.destroy({ 
            where: { id },
         })
    }
}

export { Music as MusicDao }