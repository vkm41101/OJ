const amqp=require('amqp-connection-manager');
const queueName="onlineJudgeQueue"

const connection=amqp.connect(['amqp://localhost']);

connection.on('connect', ()=>{
    console.log('Connected');
});

connection.on("disconnect", (err) => {
  console.log("Disonnected", err);
});

const channel=connection.createChannel({
    json: true,
    setup: ((channel)=> {
        return channel.assertQueue(queueName, {
            durable: true
        })
    })
});

const sendMessage= (async (data) =>{
    var ret=0;
    await channel.sendToQueue(queueName, data)
    .then(()=>{
        console.log("Message Queued Succesfully");
        ret=200;
    })
    .catch((err) => {
        console.log("System Error: %s", err.stack.toString())
        ret= 500;
    });
    return ret;
})

module.exports = {sendMessage};
