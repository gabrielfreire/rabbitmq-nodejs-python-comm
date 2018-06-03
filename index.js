const fs = require('fs');
const path = require('path');
const amqp = require('amqplib/callback_api');
const amqpurl = process.env.CLOUDAMQP_URL || "amqp://localhost";
const dataUrl = path.join(__dirname, 'data/train.csv'); 
const input = {
    action: 'sum',
    data: [123,3,4,53,321]
}
const dataInput = {
    action: 'data',
    data: dataUrl
}

_getRabbitMQConnection(dataInput);

function _getRabbitMQConnection(input, callback) {
    /**
        Talk to python throught RabbitMQ on messaging.py
    */
    
    amqp.connect(amqpurl, function (err, conn) {
        conn.createChannel(function (err, ch) {
            // create queues
            var compute = 'compute';
            ch.assertQueue(compute, { durable: false });
            var results = 'results';
            ch.assertQueue(results, { durable: false });

            // send data to queue
            ch.sendToQueue(compute, new Buffer(JSON.stringify(input)));

            // receive data from result queue
            ch.consume(results, function (msg) {
                // res.send(msg.content.toString());
                console.log(`Result for ${input.action}: ${msg.content.toString()}`);
                
                if(callback) callback(msg.content.toString());
            }, { noAck: true });
        });
        setTimeout(function () { conn.close(); }, 500);  
    });
}