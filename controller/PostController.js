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
userName: string
*/
router.get('/', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        //Verify the if the token is valid
        const userInformation = await userFunctions.verifyTooken(req);
        const foundPosts = await Post.Post.findAll({
            where: {
                userName: req.body.userName
            }
        }, {transaction: t});
        await pag.pagination(req, res, foundPosts);
        await t.commit();
        res.send(res.paginatedResults);
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }

})


/*
Body:
photo: file
*/
router.post('/', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const createdPost = await Post.Post.create({
            userName: userInformation.userName,
            oldName: req.files.photo.name
        }, {transaction: t});
        await fileFunctions.addFile(req.files.photo.data, createdPost);
        await t.commit();
        res.status(200).send({text: 'Post created!'});
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }
    
});


/*
Body:
id: integer
*/
router.delete('/', async(req, res, next)=>{
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
        res.status(200).send({text: 'Post deleted!'});
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }

});



module.exports = router;