const amqp=require('amqplib/callback_api');
// const sleep=require('sleep');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

amqp.connect('amqp://localhost', (error1, connection)=>{
    if(error1)
    {
        throw error1;
    }
    connection.createChannel((error2,channel)=>{
        const queueName="Task_Queue"
        channel.assertQueue(queueName, {
            durable: true,
        });
        channel.prefetch(1);
        channel.consume(queueName, async (msg)=>{
            var secs= msg.content.toString().split('.').length-1;
            console.log(" [x] Message recieved: %s", msg.content.toString());
            await sleep(secs*1000);
            console.log("[x] Done %s", msg.content.toString());
            channel.ack(msg);
        }, {
            noAck : false,
        })
    });
});