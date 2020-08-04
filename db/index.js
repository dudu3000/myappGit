const Sequelize = require('sequelize');

//Establish the connection with db server
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {

    host: process.env.DB_HOST,
    dialect: 'postgres'

});



exports.sequelize = sequelize;
//Import models so they can be exported only from this module
const post = require('./models/Post.js');
const user = require('./models/User.js');
const file = require('./models/File.js');

exports.db = {
    post: post,
    user: user,
    file: file
}


