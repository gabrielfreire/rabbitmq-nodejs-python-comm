# rabbitmq-nodejs-python-comm
Communication between Python and NodeJS using RabbitMQ

`npm install`

### Install Python 3.6
#### Dependencies
`pip install numpy`
`pip install pika`
`pip install urllib3`

Run the python worker `python messenger.py`

### Start index.js
Open other terminal window and run `npm run start`

#### Output
'''
max -> 10238               
min -> 10                  
sum -> 26209260            
std -> 2953                
mean -> 5124               
arange array length -> 5115
It took 0.404s
'''

#### index.js Code
'''javascript
const Numpy = require('./numpy');
const np = new Numpy();

async function init() {
    let startTime = new Date().getTime();
    try {
        let arr = await np.arange(10, 10240, 2);
        let max = await np.max(arr);
        let sum = await np.sum(arr);
        let std = await np.std(arr);
        let min = await np.min(arr);
        let mean = await np.mean(arr);
        console.log(`max -> ${max}`);
        console.log(`min -> ${min}`);
        console.log(`sum -> ${sum}`);
        console.log(`std -> ${std}`);
        console.log(`mean -> ${mean}`);
        console.log(`arange array length -> ${arr.length}`);
    } catch(e) {
        console.error(e.error);
    }
    let endTime = new Date().getTime();
    console.log(`It took ${(endTime - startTime) / 1000}s`);
}
init();
'''
