const pag = require('./../utils/pagination.js');
const fileFunctions = require('./../utils/FileFunctions.js');
const userFunctions = require('./../utils/UserFunctions.js');
const errors = require('./../utils/ErrorsHandler.js');
const express = require('express');
const multer = require('multer');
const router = express.Router({
    mergeParams: true
});
const userdB = require('./../db/index.js');
const User = require('../db/models/User.js');
const ErrorsHandler = require('./../utils/ErrorsHandler.js');
const sequelize = userdB.sequelize;

const upload = multer({
    dest: './../db/photos/'
})


router.post('/editProfile', upload.single("file"), async(req, res, next)=>{
    var imageData = ''
    if(req.files !== null)
        imageData = req.files.file.data;
    

    [
        email,
        birthDay,
        profileDescription
    ]=[
        req.query.email,
        req.query.birthDay,
        req.query.profileDescription
    ];
    var userInformation = '';
    createdPost = '';
    const t = await sequelize.transaction();

    try{
        userInformation = await userFunctions.verifyTooken(req);
        [
            userName
        ]=[
            userInformation.user.userName
        ];
        const updateProfile = await User.User.update({
            email: email,
            birthDay: birthDay,
            profileDescription: profileDescription
        },{
            where: {
                userName: userName
            }
        }, {transaction: t});
        if(imageData !== ''){
            await fileFunctions.addProfilePic(imageData, userName);
        }
        const newData = await User.User.findOne({
            where:{
                userName: userName
            }
        })
        const token = await userFunctions.createToken(newData)
        await t.commit();
        res.status(200).send({text: 'Profile edited!', token: token});
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }
    
});


router.post('/profile', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        [
            userName
        ]=[
            req.body.userName
        ];
        const fileData = await fileFunctions.encode(new Uint8Array(await fileFunctions.getProfilePic(userName)));
        await t.commit();
        res.status(200).send({
            data: fileData
        });
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }
});




/*
Quearies:
/?page=(integer)&limit=(interger)
*/
router.get('/', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const foundUsers = await User.User.findAll({}, {transaction: t});
        await pag.pagination(req, res, foundUsers);
        await t.commit();
        res.status(200).send({
            paginated: res.paginatedResults,
            tokne: userInformation.token
        });
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }

});


router.get('/info', async(req, res, next)=>{
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        res.status(200).send(userInformation.user);
    }catch(err){
        next(err, req, res, next);
    }
})

/*
Body:
userName: string
password: string
minutes: int
*/
router.post('/login', async(req, res, next)=>{
    [
        userName,
        password,
    ]=[
        req.body.userName,
        req.body.password,
    ];
    
    const t = await sequelize.transaction();
    try{
        await userFunctions.validateLoginData(userName, password);
        const foundUser = await User.User.findOne({
            where: {
                userName: userName,
                password: password
            }
        }, {transaction: t });
        await userFunctions.validateLogin(foundUser);
        const accessToken = await userFunctions.createToken(foundUser);
        await t.commit();
        res.status(200).send({text: 'You\'re now logged in!\n', token: accessToken});
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
    [
        firstName,
        lastName,
        userName,
        password,
        email,
        birthDay,
        token
    ]=[
        req.body.firstName,
        req.body.lastName,
        req.body.userName,
        req.body.password,
        req.body.email,
        req.body.birthDay,
        req.body.tooken
    ];
    const t = await sequelize.transaction();
    try{
        await userFunctions.validateRegister(req.body);
        const createdUser = await User.User.create({
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            password: password,
            email: email,
            birthDay: birthDay,
            tooken: token,
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
                userName: userInformation.user.userName
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