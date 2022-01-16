const express=require('express');
const app=express();
const fs = require('fs');


const server = app.listen(3000, function(){
    var host= server.address().address;
    var port= server.address().port;
    console.log("Listening http://%s:%s", host, port);
})