const index = require('./../index.js');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = index.sequelize;
class File extends Model{}

//Format of the table
File.init({
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    oldName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,  
        references: {
            model: 'Post',
            key: 'file',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          }
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userName:{
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'file'
});

module.exports = {

    File: File

}