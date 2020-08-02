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
*/
router.get('/', async(req, res, next)=>{

    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const foundUsers = await User.User.findAll({}, {transaction: t});
        await pag.pagination(req, res, foundUsers);
        await t.commit();
        res.status(200).send(res.paginatedResults);
    }catch(err){
        await t.rollback();
        next(err, req, res, next)
    }

});

/*
Body:
userName: string
password: string
minutes: int
*/
router.post('/login', async(req, res, next)=>{
    const {
        'req.body' : body
    } = req;

    const t = await sequelize.transaction();
    try{
        const foundUser = await User.User.findOne({
            where: {
                userName: body.userName,
                password: body.password
            }
        }, {transaction: t });
        await userFunctions.validateLogin(foundUser);
        const accessToken = await userFunctions.createToken(foundUser, body.minutes);
        await t.commit();
        res.status(200).send({text: 'You\'re now logged in! You have ' + body.minutes + ' minutes before you\'ll be disconnected!\n', token: accessToken});
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
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
*/ 
router.post('/', async(req, res, next)=>{
    const {
        'req.body' : body
    } = req;

    const t = await sequelize.transaction();
    try{
        await userFunctions.validateRegister(body);
        const createdUser = await User.User.create({
            firstName: body.firstName,
            lastName: body.lastName,
            userName: body.userName,
            password: body.password,
            email: body.email,
            birthDay: body.birthDay,
            tooken: body.tooken,
            minutes: 0
        }, {transaction: t});
        await t.commit();
        res.status(201).send({text: 'Account created!'});
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }

});

/*
Body:
*/
router.delete('/', async(req, res, next)=>{

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
        next(err, req, res, next);
    }

});

module.exports = router;