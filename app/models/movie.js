import { Sequelize, Model } from 'sequelize'
import sequelize from '../libs/db'
import { config } from 'lin-mizar'

class Movie extends Model {

}

Movie.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: {
            type: Sequelize.STRING(64),
            // get() {
            //     const image = this.getDataValue('image')
            //     return config.getItem('localMainImgUrlPrefix') + image
            // }
        },
        content: {
            type: Sequelize.STRING(300),
            allowNull: true
        },
        pubdate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        fav_nums: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        title: {
            type: Sequelize.STRING(50)
        },
        type: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.INTEGER
        }
    },
    {
        // 定义表名
        tableName: 'movie',
        // 定义模型名称
        modelName: 'movie',
        // 启用软删除
        paranoid: true,
        // 自动写入时间
        timestamps: true,
        // 重命名时间字段
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize
    }
)


export { Movie as MovieModel }