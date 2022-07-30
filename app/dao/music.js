import { MusicModel } from "../models/music";

class Music {

    static async getMusicList() {
        return await MusicModel.findAll()
    }

    static async addMusic(v) {
        return await MusicModel.create(v)
    }
}

export { Music as MusicDao }