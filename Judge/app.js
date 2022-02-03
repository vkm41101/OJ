const fs = require('fs');
const mongoose= require('mongoose');
const { execSync } =require('child_process');


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


runSubmission= async (quesID, submissionID, language, containerName) =>{
    var testCases=[];
    var length=0;
    await questionTestCase.findOne({questionID: quesID}).then(async (data)=>{
      if(data.toString()=='')
      {
          return -1;
      }
      testCases= data.testCases;
      length=testCases.length;
      for (let i = 0; i <length; i++) {
        await fs.writeFileSync(__dirname + '/folderrun/sampleTestCase/tc'+(i+1).toString()+'i.txt', testCases[i].input);
        await fs.writeFileSync(__dirname + '/folderrun/sampleTestCase/tc'+(i+1).toString()+'o.txt', testCases[i].output);
      }
    })
    //compille
    var compileCommand="";
    if(language=='C')
    {
      compileCommand="gcc /home/folderrun/"+ submissionID + ".c -o /home/folderrun/"+submissionID+".out";
    }
    else if(language=='C++')
    {
      compileCommand="g++ /home/folderrun/"+ submissionID + ".cpp -o /home/folderrun/"+submissionID+".out"
    }
    else if(language=='java')
    {
      compileCommand="";
    }
    if(language!='python3')
    {
      console.log('sudo docker exec ' + containerName + " " + compileCommand);
      try
      {
        await execSync('sudo docker exec ' + containerName + " " + compileCommand);
      }
      catch
      {
        return -5;
      }
    }
    
    
    //execution
    var executeCommand = "";
    if(language !='python3')
    {
      executeCommand = "/home/folderrun/"+submissionID+".out "
    }
    else 
    {
      executeCommand = "python3 /home/folderrun/" + submissionID + ".py ";
    }

    for(let i = 0; i<length; i++)
    {
      inputPath = "home/folderrun/sampleTestCase/tc" + (i + 1).toString() + "i.txt";
      outputPath = 'home/folderrun/outputAnswer/tc'+(i+1).toString()+'a.txt'
      executeCommand1 = executeCommand + " < " + inputPath + " > " + outputPath;
      console.log("sudo docker exec -it " + containerName + ' /bin/sh -c "' + executeCommand1 + '"');
      await execSync("sudo docker exec " + containerName + ' /bin/sh -c "' + executeCommand1 + '"', (err, stdout, stderr)=>{
        if(stderr)
        {
          return -3
        }
        if(err)
        {
          return -2
        }
      });
    }
    return 0;
}

(async ()=>{var result= await runSubmission("Q21", "test", "python3", "eager_grothendieck");
console.log(result);})();

module.exports = { runSubmission };