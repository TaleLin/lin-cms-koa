import { NotFound } from "lin-mizar";
import { MovieModel } from "../models/movie";

class Movie {
    static async getMovieList() {
        return await MovieModel.findAll()
    }

    static async addMovie(v) {
        return await MovieModel.create(v)
    }

    static async editMovie(id, params) {
        const movie = await MovieModel.findByPk(id)
        if (!movie) {
            throw new NotFound()
        }

        return await movie.update({ ...params })
    }

    static async deleteMovieById(id) {
        return await MovieModel.destroy({ 
            where: { id },
         })
    }
}

export { Movie as MovieDao }