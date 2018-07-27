# rabbitmq-nodejs-python-comm
Examples of communication between Python and NodeJS using RabbitMQ, ZEROMQ and loading Python and Numpy using WebAssembly and CPython `PyodideNode/`

`npm install`

### Install Python 3.6
#### Dependencies
`pip install numpy`
`pip install pika`
`pip install urllib3`

Run the python worker for RabbitMQ `python messenger.py`
Run the python worker for ZeroMQ `python zeromq_messenger.py`

### Start index.js
Open other terminal window and run `npm run start`

#### index.js Code
```javascript
const Numpy = require('./numpy');
// const Numpy = require('./webassembly_numpy');
const np = new Numpy();

async function init() {
    // await np.init(); // webassembly
    let startTime = new Date().getTime();
    try {
        // np.testNumpy(); // webassembly
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
```

#### Output
```
max -> 10238               
min -> 10                  
sum -> 26209260            
std -> 2953                
mean -> 5124               
arange array length -> 5115
It took 0.404s
```
It is faster using webassembly `0.004s`