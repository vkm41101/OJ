const amqp = require("amqplib/callback_api");
const fs = require("fs");
const { exec } = require("child_process");
const { getFromRedis, setInRedis } = require("./redis.js");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

amqp.connect("amqp://localhost", (error1, connection) => {
  if (error1) {
    throw error1;
  }
  connection.createChannel((error2, channel) => {
    const queueName = "onlineJudgeQueue";
    channel.assertQueue(queueName, {
      durable: true,
    });
    channel.prefetch(1);
    channel.consume(
      queueName,
      async (msg) => {
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
        else if(message.language=='C')
        {
            extension=='c';
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
            await fs.writeFile("./Judge/folderrun/"+fileID+'.'+extension, message.src, (err) => {
                if (err) {
                  throw err;
                }
                console.log("file Written");
              }
            );
            exec('echo 51101 | sudo -S docker run -v /home/vivek/PersonalSet/OJBh/Judge/folderrun/:/home/folderrun/ -dt --memory="256m" --cpus="1" ubuntu-comp', (err,stdout, stderr)=>{
              if(stderr)
              {
                throw stderr; 
              }
              exec("sudo docker ps -a", (err, stdout, stderr) => {
                var lst = stdout.split(" ");
                containerName = lst[lst.length - 1].split("\n")[0];
              });
            })
            await exec("sudo docker stop $(sudo docker ps -a -q)");
            await exec("sudo docker rm $(sudo docker ps -a -q)");
            channel.ack(msg);
        }
    },
      {
        noAck: false,
      }
    );
  });
});
