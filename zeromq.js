
const zmq = require('zeromq');
const requester = zmq.socket('req');

const Status = {
    ERROR: 'error',
    SUCCESS: 'success',
    UNINITIALIZED: 'notReady'
}
class ZMQWrap {
    constructor(connectionUrl) {
        this.connectionUrl = connectionUrl || 'tcp://localhost:5563';
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
            let startTime = new Date().getTime();
            requester.send(JSON.stringify(input));
            requester.on("message", function(reply) {
                // console.log(`Received reply: [ ${reply.toString()} ]`);
                result = JSON.parse(reply.toString());
                self.status = Status.SUCCESS;
            });
            requester.connect(this.connectionUrl);
            // try until its ready
            function finnish() {
                let now = new Date().getTime();
                let elapsedTime = now - startTime;
                if(elapsedTime > timeLimit) { // timeout
                    reject({ error: `Connection timeout! maximum wait time is ${timeLimit / 1000}s, you probably forgot to start your Worker run 'python zeromq_messenger.py'` });
                    setTimeout(()=>requester.close(), 500);
                } else if(self.status == Status.SUCCESS){ // success
                    resolve(result);
                    setTimeout(()=>requester.close(), 500);
                } else if (self.status == Status.ERROR){ // error
                    reject({ error: 'An error ocurred!' });
                    setTimeout(()=>requester.close(), 500);
                } else {
                    setTimeout(finnish, 10);
                }
            }
            finnish();
        });
       
   }
}
module.exports = ZMQWrap;