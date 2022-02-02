const fs = require('fs');
const mongoose= require('mongoose');
const { exec } =require('child_process');


(async ()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/OnlineJudgeDataBase");
})();

const Schema= mongoose.Schema;

const testCaseSchema = new Schema({
  input: String,
  output: String,
});

var questionTestCase = mongoose.model(
  "questionTestCases",
  new Schema({ questionID: String, testCases: [testCaseSchema] }, { collection: "questiontestcases" })
); 


runSubmission= (quesID, language, containerName) =>{
    var testCases=[];
    var length=0;
    questionTestCase.findOne({questionID: quesID}).then((data)=>{
        if(data.toString()=='')
        {
            return -1;
        }
        testCases= data.testCases;
        length=testCases.length;
        for (let i = 0; i <length; i++) {
          fs.writeFileSync('./folderrun/sampleTestCase/tc'+(i+1).toString()+'i.txt', testCases[i].input);
          fs.writeFileSync('./folderrun/sampleTestCase/tc'+(i+1).toString()+'o.txt', testCases[i].output);
        }

    })
}

runSubmission('Q21', 'python', 'qk')