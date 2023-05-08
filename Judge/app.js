const fs = require('fs');
const mongoose= require('mongoose');
const { exec, execSync } =require('child_process');
const { setInRedis } = require('./config/redis.js');
const { stdout } = require('process');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

var flag=true;

checkOutput = (submissionID, length) => {
  var flag = true;
  setInRedis(submissionID, 'AC');
  for(var i=0; i<length; ++i)
  {
    testFile= __dirname+'/folderrun/sampleTestCase/tc'+(i+1).toString()+'o.txt';
    outputFile= __dirname + '/folderrun/outputAnswer/tc' + (i+1).toString()+'a.txt';
    console.log("python " + __dirname + "/check.py " + testFile + " " + outputFile);
    exec("python " + __dirname + "/check.py " + testFile + " " + outputFile, (err, stdout, stderr) => {
      console.log(stdout);
      if(stdout == "WA\n")
      {
        setInRedis(submissionID, 'WA');
        flag= false;
      }
    });
  }
};


runSubmission= async (quesID, submissionID, language, containerName,timeOut) =>{
    var testCases=[];
    var length=0;
    flag=true;
    console.log(quesID);
    questionTestCase.findOne({questionID: quesID}).then(async (data)=>{
      // console.log(data);
      if(data.toString()=='')
      {
          return -1;
      }
      testCases= data.testCases;
      length=testCases.length;
      setInRedis(submissionID+'length', length);
      for (let i = 0; i <length; i++) {
        fs.writeFileSync(__dirname + '/folderrun/sampleTestCase/tc'+(i+1).toString()+'i.txt', testCases[i].input);
        fs.writeFileSync(__dirname + '/folderrun/sampleTestCase/tc'+(i+1).toString()+'o.txt', testCases[i].output);
      }
      if(language != 'python3')
      {
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
        console.log("docker exec " + containerName + " " + compileCommand);
        exec("docker exec " + containerName + " " + compileCommand, (err, stdout, stderr)=>{
          if(err || stderr)
          {
            flag=false;
            console.log(stderr);
            setInRedis(submissionID, "CE");
            // throw err;
            return -5;
          }
          var executeCommand = "/home/folderrun/"+submissionID+".out "
          for(let i = 0; i<length; i++)
          {
            inputPath = "home/folderrun/sampleTestCase/tc" + (i + 1).toString() + "i.txt";
            outputPath = 'home/folderrun/outputAnswer/tc'+(i+1).toString()+'a.txt'
            executeCommand1 = executeCommand + " < " + inputPath + " > " + outputPath;
            console.log("docker exec -it " + containerName + ' /bin/sh -c "' + executeCommand1 + '"');
            try {
              execSync("docker exec " + containerName + ' /bin/sh -c "' + executeCommand1 + '"', { timeout: timeOut }, (err, stdout, stderr) => {
                  if (err || stderr) {
                    flag=false;
                    setInRedis(submissionID, "timeOut");
                    throw err;
                  }
                }
              );
            } catch {
              flag = false;
              setInRedis(submissionID, "timeOut");
              return -5;
            }
          }
        })
      }
      else
      {
        var executeCommand = "python /home/folderrun/"+submissionID+".py "
        for(let i = 0; i<length; i++)
        {
          inputPath = "home/folderrun/sampleTestCase/tc" + (i + 1).toString() + "i.txt";
          outputPath = 'home/folderrun/outputAnswer/tc'+(i+1).toString()+'a.txt'
          executeCommand1 = executeCommand + " < " + inputPath + " > " + outputPath;
          console.log("docker exec -it " + containerName + ' /bin/sh -c "' + executeCommand1 + '"');
          try
          {
            execSync("docker exec " + containerName + ' /bin/sh -c "' + executeCommand1 + '"', {timeout: timeOut},(err, stdout, stderr)=>{
              if(err || stderr)
              {
                console.log(err);
                setInRedis(submissionID, "timeOut");
                flag=false;
                return -5;
              }
            });
          }
          catch
          {
            setInRedis(submissionID, 'timeOut');
            flag = false;
            return -5;
          }
        }
      }

    });
    await delay(2000);
    await execSync("docker stop "+containerName, (err,  stdout, stderr)=>{
      console.log("Docker stopped")
    });
    await exec("docker rm " + containerName, (err, stdout, stderr) => {
      console.log("Docker deleted");
    });
    if(flag)
    {
      await checkOutput(submissionID, length);
      await delay(length*3000);
      for(var i=0; i<length; ++i)
      {
        var answerFile= __dirname+"\\folderrun\\outputAnswer\\tc"+(i+1).toString()+"a.txt";
        var inputFile= __dirname+"\\folderrun\\sampleTestCase\\tc"+(i+1).toString()+"i.txt";
        var outputFile= __dirname+"\\folderrun\\sampleTestCase\\tc"+(i+1).toString()+"o.txt";
        execSync("del /f "+answerFile);
        execSync("del /f " + inputFile);
        execSync("del /f " + outputFile);
      }
    }
    return 0;
}

module.exports = { runSubmission };
