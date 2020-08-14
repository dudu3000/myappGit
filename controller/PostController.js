const fileFunctions = require('./../utils/FileFunctions.js');
const userFunctions = require('./../utils/UserFunctions.js');
const pag = require('./../utils/pagination.js');
const express = require('express');
const multer = require('multer');
const router = express.Router({
    mergeParams: true
});
const postdB = require('./../db/index.js');
const Post = require('../db/models/Post.js');
const File = require('../db/models/File.js');
const sequelize = postdB.sequelize;



const upload = multer({
    dest: './../db/photos/'
})


/*
Body:
photo: file
*/
router.post('/upload', upload.single("file"), async(req, res, next)=>{
    console.log(req);
    var userInformation = '';
    createdPost = '';
    const t = await sequelize.transaction();
    const t1 = await sequelize.transaction();
    try{
        userInformation = await userFunctions.verifyTooken(req);
        createdPost = await Post.Post.create({
            userName: userInformation.userName,
            title: req.query.title,
            description: req.query.description,
            userId: userInformation.id
        }, {transaction: t});
        await t.commit();
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }


    
    try{
        console.log(userInformation.id);
        const createdFile = await File.File.create({
            oldName: req.files.file.name,
            name: userInformation.userName + '-' + createdPost.id,
            path: './../../../../myappGit/db/photos/' + userInformation.userName + '-' + createdPost.id + '.jpg',
            userName: userInformation.userName,
            postId: createdPost.id
        }, {transaction: t1})
        await fileFunctions.addFile(req.files.file.data, createdPost);
        await t1.commit();
        res.status(200).send({text: 'Post created!'});
    }catch(err){
        await t1.rollback();
        await Post.Post.destroy({
            where: {
                id: createdPost.id
            }
        });
        next(err, req, res, next);
    }
    
});


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
id: integer
*/
router.delete('/', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const deletedFile = await File.File.destroy({
            where: {
                postId: req.body.id,
                userName: userInformation.userName
            }
        }, {transaction: t});
        const deletedPost = await Post.Post.destroy({
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