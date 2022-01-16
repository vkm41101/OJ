const express = require("express");
const { json } = require("express/lib/response");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

const Schema = mongoose.Schema;

const testCaseSchema = new Schema({
  input: String,
  output: String,
});

const testCase = mongoose.model("testCase", testCaseSchema);

const questionTestCaseSchema = new Schema({
  questionID: String,
  testCases: [testCaseSchema],
});

const questionTestCase = mongoose.model(
  "questionTestCases",
  questionTestCaseSchema
);

/*
test case upload
{
  inputSRC:"dhjkb",
  outputSRC:"hnn n"
}
*/

app.post("/:quesID", async (req, res) => {
  const testcase = new testCase({
    input: req.body.inputSRC.toString(),
    output: req.body.outputSRC.toString(),
  });
  questionTestCase
    .find({ questionID: req.params.quesID.toString() })
    .then(async (data) => {
      if (data.toString() == "") {
        const newTestCase = new questionTestCase({
          questionID: req.params.quesID,
          testCases: [testcase],
        });
        await newTestCase.save();
      } else {
        await questionTestCase.updateOne(
          { questionID: req.params.quesID },
          { $push: { testCases: testcase } }
        );
      }
      res.end("Updated");
    });
});

const server = app.listen(process.env.PORT || 3000, async function () {
  await mongoose.connect("mongodb://127.0.0.1:27017/OnlineJudgeDataBase");
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening http://%s:%s", host, port);
});
