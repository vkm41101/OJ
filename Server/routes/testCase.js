const express = require("express");
const { json } = require("express/lib/response");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");

const router = express.Router();
router.use(bodyParser.json());

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

const questionTestCase = mongoose.model("questionTestCases", questionTestCaseSchema);

router.post("/:quesID", async (req, res) => {
  const testcase = new testCase({
    input: req.body.inputSRC.toString(),
    output: req.body.outputSRC.toString(),
  });
  questionTestCase
    .find({ questionID: req.params.quesID.toString() })
    .then(async (data) => 
    {
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

router.get('/:quesID/:testCaseNumber', (req, res)=>{
  if(req.params.testCaseNumber <=0)
  {
    res.status(400).send("Invalid Request: Invalid TestCase Number requested");
  }
  else
  {
    questionTestCase
      .findOne({ questionID: req.params.quesID })
      .then(async (data) => {
        if (data == null) {
          res.status(404).send("Invalid Request: Question Code Not Found");
        } else {
          var requiredTestCases = data.testCases;
          try{
            var requiredTestCase =requiredTestCases[req.params.testCaseNumber - 1];
            res.send(
              '{ "inputSRC": "' +
                requiredTestCase.input +
                '", "outputSRC": "' +
                requiredTestCase.output +
                '" \n}'
            );
          }
          catch (e) {
            res.status(400).send("Invalid Request")
          }
        }
      });
  }
});

router.delete('/delete-all/:quesID', async (req, res)=>{
  questionTestCase.findOne({questionID:req.params.quesID})
  .then(async (data)=>{
    if(data == null){
      res.status(404).send("Invalid Request: Question Code Not Found");
    }
    else 
    {
      try{
        questionTestCase.deleteOne({questionID: req.params.quesID})
        .then(()=>{
          res.status(200).send("All test Cases Deleted");
        });
      }
      catch (err)
      {
        res.status(400).send("Invalid Request");
      }
    }
  });
});

module.exports = router;
