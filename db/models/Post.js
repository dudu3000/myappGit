const index = require('./../index.js');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = index.sequelize;
class Post extends Model{}

//Format of the table
Post.init({
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          }
    }
},{
    sequelize,
    modelName: 'posts'
});

module.exports = {

    Post: Post

}