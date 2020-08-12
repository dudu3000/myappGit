const User = require('./../db/models/User.js');
var moment = require('moment');
const jwt = require('jsonwebtoken');
const errors = require('./../utils/ErrorsHandler.js');

//Used for Login
function validateLogin(foundUser){
    if(foundUser == null)
        errors.failUser('Username or password incorrect!');
}

//Used to check the length of inputs on creating new account
function validateRegister(createdUser){

    if(createdUser.firstName.length < 1 || createdUser.firstName.lenght > 40)
        errors.failUser('Firstname must contain at least 1 character and no more than 40 characters!');
    if(createdUser.lastName.length < 1 || createdUser.lastName.lenght > 40)
        errors.failUser('Lastname must contain at least 1 character and no more than 40 characters!');
    if(createdUser.userName.length < 5 || createdUser.userName.lenght > 40)
        errors.failUser('Username must contain at least 5 character and no more than 40 characters!');
    if(createdUser.password.length < 5 || createdUser.password.length > 40)
        errors.failUser('Password must contain at least 5 characters and no more than 40 characters!');
    if(createdUser.email.length < 1)
        errors.failUser('You must enter your email adress!');
    if(createdUser.birthDay == null)
        errors.failUser('Please enter your birthday!');
}



//Used on login to create a token
function createToken(foundUser, requestMinutes){

    const user = {
        userName: foundUser.userName,
        email: foundUser.email,
        birthDay: foundUser.birthDay,
        id: foundUser.id
    }
    //Throw error if the requested amount of minutes is over 60 minutes
    if(requestMinutes > 60)
        errors.failUser('The amount of time requested is over 60 minutes!');
    
    //Create the token
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: requestMinutes + 'm' })
    return accessToken;
}

//Used everytime the user tries to action something that requires to be loggedin
async function verifyTooken(requestHeaders){

    const authHeader = requestHeaders.headers['authorization'];
    const token = authHeader;

    if(token == null)
        errors.failUser("Token is missing!\n");
    
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err)
        errors.failUser('Invalid token!\n');
        return user;
    });
    return user;
}


module.exports = {
    validateLogin: function(foundUser){
        return validateLogin(foundUser);
    },
    validateRegister: function(createdUser){
        return validateRegister(createdUser);
    },
    createToken: function(foundUser, requestMinutes){
        return createToken(foundUser, requestMinutes);
    },
    verifyTooken: function(requestHeaders){
        return verifyTooken(requestHeaders);
    }
};