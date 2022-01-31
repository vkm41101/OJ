const amqp = require("amqplib/callback_api");
const fs = require("fs");
const { exec } = require("child_process");
const { getFromRedis, setInRedis } = require("./redis.js");

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
            // await exec("touch " + "/home/Personal Set/OJBh/Judge/folderrun/" + fileID + "." + extension);
            console.log('file name: '+'../folderrun/'+fileID+'.'+extension)
            await fs.writeFile("./Judge/folderrun/"+fileID+'.'+extension, message.src, (err) => {
                if (err) {
                  throw err;
                }
                console.log("file Written");
              }
            );
                channel.ack(msg);
        }
    },
      {
        noAck: false,
      }
    );
  });
});
