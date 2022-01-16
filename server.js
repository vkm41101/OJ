const express=require('express');
const app=express();
const mongoose=require('mongoose');
const testCases=require('./routes/testCase.js');
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

app.use('/testCase', testCases);


const server = app.listen(process.env.PORT || 3000, async function () {
  await mongoose.connect("mongodb://127.0.0.1:27017/OnlineJudgeDataBase");
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening http://%s:%s", host, port);
});