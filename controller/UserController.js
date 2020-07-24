const pag = require('./../utils/pagination.js');
const userFunctions = require('./../utils/UserFunctions.js');
const errors = require('./../utils/ErrorsHandler.js');
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const userdB = require('./../db/index.js');
const User = require('../db/models/User.js');
const ErrorsHandler = require('./../utils/ErrorsHandler.js');
const sequelize = userdB.sequelize;







/*
Quearies:
?page=(integer)&limit=(interger)
Body:
*/
router.get('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const foundUsers = await User.User.findAll({}, {transaction: t});
        await pag.pagination(req, res, foundUsers);
        await t.commit();
        res.status(200).send(res.paginatedResults);
    }catch(err){
        await t.rollback();
        res.status(401).send(err.message + '');
        console.log(err + '');
    }

});

/*
Body:
userName: string
password: string
*/
router.post('/login', async(req, res)=>{
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const t = await sequelize.transaction();
    try{
        const foundUser = await User.User.findOne({
            where: {
                userName: req.body.userName,
                password: req.body.password
            }
        }, {transaction: t });
        await userFunctions.validateLogin(foundUser);
        const accessToken = await userFunctions.createToken(foundUser, req.body.minutes);
        await t.commit();
        res.status(200).send({text: 'You\'re now logged in! You have ' + req.body.minutes + ' minutes before you\'ll be disconnected!\n', token: accessToken});
    }catch(err){
        await t.rollback();
        res.status(401).send(err.message + '');
        console.log(err + '');
    }

});

/*
Body:
firstName: string
lastName: string
userName: string
password: string
email: string
birthDay: yyyy-mm-dd
tooken: string
minutes: max 60.(integer)
*/ 
router.post('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        await userFunctions.validateRegister(req.body);
        const createdUser = await User.User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            password: req.body.password,
            email: req.body.email,
            birthDay: req.body.birthDay,
            tooken: req.body.tooken,
            minutes: 0
        }, {transaction: t});
        await t.commit();
        res.status(201).send('Account created!');
    }catch(err){
        await t.rollback();
        console.log(err + '');
        if(err == 'SequelizeUniqueConstraintError: Validation error')
            res.status(403).send('Username or email already used!');
        else{
            res.status(403).send(err.message + '');
        }
    }

});

/*
Body:
*/
router.delete('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const deletedUser = await User.User.destroy({
            where: {
                userName: userInformation.userName
            }
        }, {transaction: t});
        await t.commit();
        res.status(200).send('Account deleted!');
    }catch(err){
        await t.rollback();
        res.status(401).send(err.message + '');
        console.log(err + '');
    }

});

module.exports = router;