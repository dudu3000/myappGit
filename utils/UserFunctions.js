const User = require('./../db/models/User.js');
var moment = require('moment');
const jwt = require('jsonwebtoken');
const errors = require('./../utils/ErrorsHandler.js');
const USER_TIME = '5m';

//Used for Login
function validateLogin(foundUser){
    if(foundUser == null)
        errors.failUser('Username or password incorrect!');
}

//Used to check the length of inputs on creating new account
function validateRegister(createdUser){
    if(createdUser.firstName == undefined)
        errors.failUser('Couldn\'t get the First Name field, please try again!');
    if(createdUser.lastName == undefined)
        errors.failUser('Couldn\'t get the Last Name field, please try again!');
    if(createdUser.userName == undefined)
        errors.failUser('Couldn\'t get the Username field, please try again!');
    if(createdUser.password == undefined)
        errors.failUser('Couldn\'t get the Password field, please try again!');
    if(createdUser.email == undefined)
        errors.failUser('Couldn\'t get the Email field, please try again!');
    if(createdUser.birthDay == undefined)
        errors.failUser('Couldn\'t get the Birthday field, please try again!');

    if(!(/^[a-zA-Z]+$/.test(createdUser.firstName)))
        errors.failUser('First name must contains only letters!')
    if(!(/^[a-zA-Z]+$/.test(createdUser.lastName)))
        errors.failUser('Last name must contains only letters!')
    if(!(/^[a-zA-Z]/.test(createdUser.userName)))
        errors.failUser('Username must have its first character a letter!');

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


function validateLoginData(userName, password){
    if(userName == undefined)
        errors.failUser('Please fill Username field!');
    if(password == undefined)
        errors.failUser('Please fill Password field!');
}



//Used on login to create a token
function createToken(foundUser){

    const user = {
        userName: foundUser.userName,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        birthDay: foundUser.birthDay,
        profilePicture: foundUser.profilePicture,
        profileDescription: foundUser.profileDescription,
        id: foundUser.id
    }
    
    //Create the token
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '120m' });
    return accessToken;
}

//Used everytime the user tries to action something that requires to be loggedin
async function verifyTooken(requestHeaders){

    const token = requestHeaders.headers['authorization'];

    if(token == null)
        errors.failUser("Token is missing!\n", 401);
    
    var user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err)
            errors.failUser('Invalid token!\n', 401);
        return user;
    });
    delete user.iat;
    delete user.exp;
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '120m' });
    return {
        user: user,
        token: accessToken
    };
}


module.exports = {
    validateLogin: function(foundUser){
        return validateLogin(foundUser);
    },
    validateRegister: function(createdUser){
        return validateRegister(createdUser);
    },
    createToken: function(foundUser){
        return createToken(foundUser);
    },
    verifyTooken: function(requestHeaders){
        return verifyTooken(requestHeaders);
    },
    validateLoginData: function(userName, password){
        return validateLoginData(userName, password);
    }
};