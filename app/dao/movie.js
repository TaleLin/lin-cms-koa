import { MovieModel } from "../models/movie";

class Movie {
    static async getMovieList() {
        return await MovieModel.findAll()
    }

    static async addMovie(v) {
        return await MovieModel.create(v)
    }
}

export { Movie as MovieDao }