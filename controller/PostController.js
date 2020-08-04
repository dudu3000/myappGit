const fileFunctions = require('./../utils/FileFunctions.js');
const userFunctions = require('./../utils/UserFunctions.js');
const pag = require('./../utils/pagination.js');
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const postdB = require('./../db/index.js');
const Post = require('../db/models/Post.js');
const File = require('../db/models/File.js');
const sequelize = postdB.sequelize;








/*
Quearies:
?page=(integer)&limit=(interger)
Body:
userName: string
*/
router.post('/', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        //Verify the if the token is valid
        const result = {
            posts: '',
            files: ''
        }
        const userInformation = await userFunctions.verifyTooken(req);
        const foundPosts = await Post.Post.findAll({
            where: {
                userName: req.body.userName
            }
        }, {transaction: t});
        const foundFiles = await File.File.findAll({
            where: {
                userName: req.body.userName
            }
        }, {transaction: t});
        result.posts = await pag.pagination(req, res, foundPosts);
        result.files = await pag.pagination(req, res, foundFiles);
        await t.commit();
        res.send(result);
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }

})


/*
Body:
photo: file
*/
router.post('/upload', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const createdPost = await Post.Post.create({
            userName: userInformation.userName,
            title: req.body.title,
            description: req.body.description
        }, {transaction: t});
        const createdFile = await File.File.create({
            id: createdPost.id,
            oldName: req.files.photo.name,
            name: userInformation.userName + '-' + createdPost.id,
            path: './../../../../myappGit/db/photos/' + userInformation.userName + '-' + createdPost.id + '.jpg',
            userName: userInformation.userName
        })
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
        const deletedPost = await Post.Post.destroy({
            where: {
                id: req.body.id,
                userName: userInformation.userName
            }
        }, {transaction: t});
        const deletedFile = await File.File.destroy({
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