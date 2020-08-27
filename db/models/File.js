const index = require('./../index.js');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = index.sequelize;
class File extends Model{}

//Format of the table
File.init({
    oldName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Post',
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED
          }
    }
},{
    sequelize,
    modelName: 'files'
});

module.exports = {

    File: File

}