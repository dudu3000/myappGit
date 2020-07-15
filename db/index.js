const Sequelize = require('sequelize');

//Establish the connection with db server
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {

    host: process.env.DB_HOST,
    dialect: 'postgres'

});



exports.sequelize = sequelize;

const post = require('./models/Post.js');
const user = require('./models/User.js');

exports.db = {
    post: post,
    user: user
}


