const Sequelize = require('sequelize');

//Establish the connection with db server
const sequelize = new Sequelize('myapp', 'postgres', 'K3nvY19(!Pg', {

    host: 'localhost',
    dialect: 'postgres'

});



exports.sequelize = sequelize;
//Import models so they can be exported only from this module
const post = require('./models/Post.js');
const user = require('./models/User.js');
const file = require('./models/File.js');
user.User.hasMany(post.Post);
post.Post.hasOne(file.File);


sequelize.sync()

exports.db = {
    post: post,
    user: user,
    file: file
}


