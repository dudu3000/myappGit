const express = require('express');
const router = express.Router({
    mergeParams: true
});

router.get('/face', async(req, res, next)=>{
    res.status(200).send({
        message: 'OK'
    });
});

module.exports = router;