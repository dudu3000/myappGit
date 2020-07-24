const User = require('./../db/models/User.js');
var moment = require('moment');
const jwt = require('jsonwebtoken');
const errors = require('./../utils/ErrorsHandler.js');

//Used for Login
function validateLogin(foundUser){

    if(foundUser == null)
        new errors.failLogin('Username or password incorrect!');

}

//Used on login
function createToken(foundUser, requestMinutes){

    const user = {
        userName: foundUser.userName,
        email: foundUser.email,
        birthDay: foundUser.birthDay
    }
    
    console.log('test');
    if(requestMinutes > 60)
        new errors.failLogin('The amount of time requested is over 60 minutes!');
    
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: requestMinutes + 'm' })
    return accessToken;
}

//Used everytime the user tries to action something that requires to be loggedin
async function verifyTooken(requestHeaders){

    const authHeader = requestHeaders.headers['authorization'];
    const token = authHeader;

    if(token == null)
        throw Error("Token is missing!\n");
    
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err)
        throw Error('Invalid token!\n');
        return user;
    });
    return user;
}


module.exports = {
    validateLogin: function(foundUser){
        return validateLogin(foundUser);
    },
    createToken: function(foundUser, requestMinutes){
        return createToken(foundUser, requestMinutes);
    },
    verifyTooken: function(requestHeaders){
        return verifyTooken(requestHeaders);
    }
};