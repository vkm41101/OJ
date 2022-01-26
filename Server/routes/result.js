const express= require('express');
const bodyParser=require('body-parser');
const { json } = require("express/lib/response");
const {getFromRedis} = require('../config/redis.js');

const router=express.Router();
router.use(bodyParser.json());

router.get('/:submissionID', async (req,res) =>{
    var key=req.params.submissionID.toString();
    var status= await getFromRedis(key);
    if(status==null)
    {
        res.status(404).end("Submission ID not found");
    }
    else res.status(200).end(status.toString());
})

module.exports = router;