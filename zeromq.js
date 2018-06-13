
const zmq = require('zeromq');
const requester = zmq.socket('req'); // data-io
const subscriber = zmq.socket('sub'); // real-time

const Status = {
    ERROR: 'error',
    SUCCESS: 'success',
    UNINITIALIZED: 'notReady'
}
class ZMQWrap {
    constructor(connectionUrl) {
        let local = 'tcp://localhost';
        this.requesterUrl = connectionUrl || `${process.env.URL || local}:5563`;
        this.subscriberUrl = connectionUrl || `${process.env.URL || local}:5562`;
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
            let timeLimit = (60 * 1000) * 5;
            let startTime = new Date().getTime();
            if(input.type == 'train') timeLimit = null;
            subscriber.on('message', (reply) => {
                result = JSON.parse(reply.toString());
                if(!result) this.status = Status.ERROR;
                if(result.data.epoch == (input.epochs - 1)) {
                    self.status = Status.SUCCESS;
                }
                // TODO: send event to train class for each epoch
                console.log(`Received real-time data: Epoch -> ${result.data.epoch}`);
            });
            subscriber.connect(this.subscriberUrl);
            subscriber.subscribe("");
        
            requester.send(JSON.stringify(input));
            requester.on("message", function(reply) {
                console.log(reply.toString());
                result = JSON.parse(reply.toString());
                self.status = Status.SUCCESS;
            });
            requester.connect(this.requesterUrl);
            
            // try until its ready
            function finnish() {
                let now = new Date().getTime();
                let elapsedTime = now - startTime;
                if(timeLimit && elapsedTime > timeLimit) { // timeout
                    reject({ error: `Connection timeout! maximum wait time is ${timeLimit / 1000}s, you probably forgot to start your Worker run 'python zeromq_messenger.py'` });
                } else if(self.status == Status.SUCCESS){ // success
                    resolve(result);
                } else if (self.status == Status.ERROR){ // error
                    reject({ error: 'An error ocurred!' });
                } else {
                    setTimeout(finnish, 10);
                    return;
                }
                setTimeout(()=> {
                    if(input.type == 'train') {
                        subscriber.close();
                    } else {
                        requester.close();
                    }
                }, 500);
            }
            finnish();
        });
       
   }
}
module.exports = ZMQWrap;