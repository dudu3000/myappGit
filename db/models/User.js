const index = require('./../index.js');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = index.sequelize;
class User extends Model{}

//Format of the table
User.init({
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    birthDay: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    profilePicture: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    profileDescription: {
        type: Sequelize.STRING,
        allowNull: true
    }
},{
    sequelize,
    modelName: 'users'
});


module.exports = {

    User: User

}