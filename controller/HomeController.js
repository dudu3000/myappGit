//Include the model
const express = require('express');
const router = express.Router({
    mergeParams: true
});
//Respons for get req
router.get('/', function(req, res) {


    res.send('Welcome to get!');


})


//Respons for post req
router.post('/home', function(req, res){


    res.send('Welcome to post!');


})

module.exports = router;