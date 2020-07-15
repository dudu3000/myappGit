const index = require('./../index.js');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = index.sequelize;
class Post extends Model{}

//Format of the table
Post.init({
    userName: {
        type: Sequelize.STRING,
        allowNull: false,  
        references: {
            model: 'User',
            key: 'userName',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          }
    },
    oldName: {
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'post'
});

module.exports = {

    Post: Post

}