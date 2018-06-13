
const amqp = require('amqplib/callback_api');
const amqpurl = process.env.CLOUDAMQP_URL || "amqp://localhost";

const Status = {
    ERROR: 'error',
    SUCCESS: 'success',
    UNINITIALIZED: 'not ready'
}
class AMQWrap {
    constructor(connectionUrl) {
        this.connectionUrl = connectionUrl || amqpurl;
        this.status = Status.UNINITIALIZED;
    }

    /**
        Talk to python throught RabbitMQ on messaging.py
    */
    async exec(input) {
        const self = this;
        this.status = Status.UNINITIALIZED;
        return new Promise((resolve, reject) => {
            let result;
            let timeLimit = 5 * 1000;
            amqp.connect(this.connectionUrl, function (err, conn) {
                if(err) {
                    self.status == Status.ERROR;
                    conn.close();
                    reject({ error: `An error ocurred: ${err}` });
                }
                conn.createChannel(function (err, ch) {
                    if(err)  {
                        self.status == Status.ERROR;
                        conn.close();
                        reject({ error: `An error ocurred: ${err}` });
                    };
                    // create queues
                    var compute = 'compute';
                    ch.assertQueue(compute, { durable: false });
                    var results = 'result';
                    ch.assertQueue(results, { durable: false });
        
                    // send data to queue
                    ch.sendToQueue(compute, new Buffer(JSON.stringify(input), {persistent: true}));
                    // receive data from result queue
                    ch.consume(results, function (msg) {
                        // res.send(msg.content.toString());
                        // console.log(`Received: Result for ${input.type}: ${msg.content.toString()}`);
                        result = JSON.parse(msg.content.toString());
                        if(!result) self.status = Status.ERROR
                        else self.status = Status.SUCCESS;
                    }, { noAck: true });
                });
                let startTime = new Date().getTime();
                // try until its ready
                function finnish() {
                    let now = new Date().getTime();
                    let elapsedTime = now - startTime;
                    if(elapsedTime > timeLimit) { // timeout
                        conn.close();
                        reject({ error: `Connection timeout! maximum wait time is ${timeLimit / 1000}s, you probably forgot to start your Worker run 'python messenger.py'` });
                    } else if(self.status == Status.SUCCESS){ // success
                        conn.close();
                        resolve(result);
                    } else if (self.status == Status.ERROR){ // error
                        conn.close();
                        reject({ error: 'An error ocurred!' });
                    } else {
                        setTimeout(finnish, 50);
                    }
                }
                finnish();
            });
        })
   }
}
module.exports = AMQWrap;