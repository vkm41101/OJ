const express = require('express');
const bodyParser = require("body-parser");
const { json } = require("express/lib/response");
const {sendMessage} = require('../config/rabbitMQ.js');
const {setInRedis} = require('../config/redis.js');

const router=express.Router();
router.use(bodyParser.json());

router.post('/', async (req, res)=>{
    console.log(req.body);
    var submissionID=new Date().getTime().toString(16);
    let data = {
      questionID: req.body.questionID,
      language: req.body.language,
      timeOut: req.body.timeOut,
      src: req.body.src,
      submissionID: submissionID,
    };
    console.log(data.questionID);
    console.log(submissionID);
    var val= await sendMessage(data);
    console.log(val);
    if(val==200)
    {
        await setInRedis(submissionID, 'InQueue');
        console.log('added To Queue')
        res.status(200).send("{'status':'InQueue', 'submissionID': '"+ submissionID + "' }");
    }
    else res.status(500).send("{'status':'SystemError'}");
})

module.exports = router;