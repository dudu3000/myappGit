const fileFunctions = require('./../utils/FileFunctions.js');
const userFunctions = require('./../utils/UserFunctions.js');
const pag = require('./../utils/pagination.js');
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const postdB = require('./../db/index.js');
const Post = require('../db/models/Post.js');
const sequelize = postdB.sequelize;








/*
Quearies:
?page=(integer)&limit=(interger)
Body:
curentUser: string
userName: string
*/
router.get('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const foundPosts = await Post.Post.findAll({
            userName: req.body.userName
        }, {transaction: t});
        await pag.pagination(req, res, foundPosts);
        await t.commit();
        res.send(res.paginatedResults);
    }catch(err){
        await t.rollback();
        res.send(err + '');
        console.log(err);
    }

})


/*
Body:
curentUser: string
photo: file
*/
router.post('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        console.log(req.body);
        const userInformation = await userFunctions.verifyTooken(req);
        const createdPost = await Post.Post.create({
            userName: userInformation.userName,
            oldName: req.files.photo.name
        }, {transaction: t}, function(userName){return userName});
        await fileFunctions.addFile(req.files.photo.data, createdPost);
        await t.commit();
        res.send({text: 'Post created!'});
    }catch(err){
        await t.rollback();
        res.sendStatus(400);
        throw Error('Error:\n' + err);
    }
    
});


/*
Body:
id: integer
curentUser: string
*/
router.delete('/', async(req, res)=>{

    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const createdPost = await Post.Post.destroy({
            where: {
                id: req.body.id,
                userName: userInformation.userName
            }
        }, {transaction: t});
        await fileFunctions.removeFile(userInformation.userName, req.body.id);
        await t.commit();
        res.send('Post deleted!');
    }catch(err){
        await t.rollback();
        res.send(err + '');
        throw Error('Error:\n' + err);
    }

});



module.exports = router;