const express = require('express');
const bodyParser = require("body-parser");
const { json } = require("express/lib/response");
const {sendMessage} = require('../config/rabbitMQ.js');
const {getFromRedis, setInRedis} = require('../config/redis.js');

const app=express();
app.use(bodyParser.json());

app.post('/', async (req, res)=>{
    console.log(req.body);
    var submissionID=new Date().getTime().toString(16);
    let data = {
      questionID: req.body.quesID,
      language: req.body.language,
      timeOut: req.body.timeOut,
      src: req.body.src,
      folder: submissionID,
    };
    console.log(submissionID);
    var val= await sendMessage(data);
    console.log(val);
    if(val==200)
    {
        await setInRedis(submissionID, 'InQueue');
        console.log('added To Queue')
        res.status(200).send("{'status':'InQueue'}");
    }
    else res.status(500).send("{'status':'SystemError'}");
})

const server = app.listen(process.env.PORT || 3000, async function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening http://%s:%s", host, port);
});