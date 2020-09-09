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
const errors = require('./../utils/ErrorsHandler.js');



const upload = multer({
    dest: './../db/photos/'
})


/*id
Body:
photo: file
Params: title, description
*/
router.post('/upload', upload.single("file"), async(req, res, next)=>{
    var userInformation = '';
    createdPost = '';
    const t = await sequelize.transaction();
    const t1 = await sequelize.transaction();
    try{
        const faceDetection = await fileFunctions.faceRecognition(req.files.file.data);
        userInformation = await userFunctions.verifyTooken(req);
        createdPost = await Post.Post.create({
            userName: userInformation.userName,
            title: req.query.title,
            description: req.query.description,
            faceDetection: faceDetection,
            userId: userInformation.id
        }, {transaction: t});
        await t.commit();
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }


    
    try{
        const createdFile = await File.File.create({
            oldName: req.files.file.name,
            name: userInformation.userName + '-' + createdPost.id + '.jpg',
            path: './db/photos/' + userInformation.userName + '-' + createdPost.id + '.jpg',
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

//!TODO Nu uita sa adaugi verificarea tokenului
router.get('/face/:id', async(req, res, next)=>{
    const numberOfReturnedPosts = 4;
    const t = await sequelize.transaction();
    var fileData = [{
        data: 0,
        userName: '',
        percentage: 0
    }];
    var skip = 0;
    var limit = 100;
    try{
        const foundPost = await Post.Post.findOne({
            where: {
                id: req.params.id
            }
        });
        var allPosts = await Post.Post.findAll({
            offset: skip,
            limit: limit
        });
        const faceSimilarity = await fileFunctions.calculateParameters(foundPost.faceDetection, allPosts, req.params.id);
        for(var incrementGetFiles = 0; incrementGetFiles < numberOfReturnedPosts; incrementGetFiles++){
            const foundFile = await File.File.findOne({
                where: {
                    postId: faceSimilarity[incrementGetFiles].id
                }
            });
            fileData[incrementGetFiles] = {
                data: await fileFunctions.encode(new Uint8Array(await fileFunctions.getFile(foundFile.path))),
                userName: foundFile.userName,
                percentage: faceSimilarity[incrementGetFiles].percentage
            }
        }
        await t.commit();
        res.status(200).send({
            data: fileData
        });
    }catch(err){
        await t.rollback();
        next(err, req, res, next);
    }
});



router.get('/:id', async(req, res, next)=>{
    const t = await sequelize.transaction();
    try{
        const userInformation = await userFunctions.verifyTooken(req);
        const foundFile = await File.File.findOne({
            where: {
                postId: req.params.id
            }
        });
        const fileData = await fileFunctions.encode(new Uint8Array(await fileFunctions.getFile(foundFile.path)));
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