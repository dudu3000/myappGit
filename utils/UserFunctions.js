const User = require('./../db/models/User.js');
var moment = require('moment');
const jwt = require('jsonwebtoken');

//Used for Login
function validateLogin(foundUser){

    if(foundUser == null)
        throw Error('Logging in failed!');

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
        throw Error('Session over 60 mintues required!');
    
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