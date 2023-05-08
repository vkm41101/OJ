const amqp = require("amqplib/callback_api");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const { getFromRedis, setInRedis } = require("./redis.js");
const { runSubmission } = require('../app.js');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

var count=0;

amqp.connect("amqp://localhost", async (error1, connection) => {
  if (error1) {
    throw error1;
  }
  connection.createChannel(async (error2, channel) => {
    const queueName = "onlineJudgeQueue";
    channel.assertQueue(queueName, {
      durable: true,
    });
    channel.prefetch(1);
    await channel.consume(
      queueName,
      (msg) => {
        const message = JSON.parse(msg.content.toString());
        console.log(message);
        const fileID=message.submissionID;
        var extension='cpp';
        if(message.language=='python3')
        {
            extension='py';
        }
        else if(message.language=='java')
        {
            extension='java';
        }
        else if(message.language=="C")
        {
            extension='c';
        }
        else if(message.language!='C++')
        {
            extension='Invalid'
            setInRedis(fileID, '400:Invalid Language');
            console.log('Wrong Language');
            channel.ack(msg)
        }
        if(extension!='Invalid')
        {
            setInRedis(fileID,'Processing');
            console.log('file name: '+'../folderrun/'+fileID+'.'+extension)
            fs.writeFileSync(__dirname+"/.."+"/folderrun/"+fileID+'.'+extension, message.src, async (err) => {
                if (err) {
                  throw err;
                }
                console.log("file Written");
                
              }
            );
            var cmd='';
            if(count == 0)
            {
              cmd = 'docker run -v ' + __dirname +'/../folderrun/:/home/folderrun/ -dt --memory="512m" --cpus="1" ubuntu-comp'
              ++count;
            }
            else 
            {
              cmd = 'docker run -v '+__dirname+'/../folderrun/:/home/folderrun/ -dt --memory="512m" --cpus="1" ubuntu-comp'
            }
            console.log(cmd);
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                  throw err;
                }
                console.log("docker running");
                exec(
                  "docker ps -a",async (err, stdout, stderr) => {
                    var lst = stdout.split("\n");
                    lst=lst[1].split(" ");
                    containerName = lst[lst.length - 1].split("\n")[0];
                    console.log(containerName);
                    await runSubmission(message.questionID, fileID, message.language, containerName, message.timeOut*1000);
                    await delay(2000);
                    channel.ack(msg);
                  }
                );
              }
            );
            
        }
    },
      {
        noAck: false,
      }
    );
  });
});
