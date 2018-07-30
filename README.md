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
Open other terminal window and run `npm run fire` to execute `ZeroMQ` and `NodeJS` processes concurrently and also the `WebAssembly` code

#### index.js Code
```javascript
const Numpy = require('./webassembly_numpy'); // webassembly
const NumpyMQ = require('./numpy'); // RABBITMQ / ZEROMQ
const np = new Numpy();
const npMQ = new NumpyMQ();
async function init() {
    await np.init(); // webassembly
    let webAssStartTime = new Date().getTime();
    try {
        np.execLine('a = np.arange(10, 10240, 2)\n' + 
                    'b = np.max(a)\n' + 
                    'c = np.sum(a)\n' + 
                    'd = np.std(a)\n' + 
                    'e = np.min(a)\n' + 
                    'f = np.mean(a)\n' + 
                    'print("arange array length -> {}".format(len(a)))\n' 
                    ); // execute lines of python/numpy code
        const pyMethod = np.createMethod({  // Create a python method using numpy
            code: `def test_method(value):
        list = [1, 20, 3, 12, 31, 501, 123, 320, 132]
        a = [x * 256 for x in list]
        b = [np.log(y)**2 for y in a]
        return np.array(b) * np.array(value)`, 
            
            name: 'test_method'
        });
        const result = pyMethod(new Int32Array([1, 20, 3, 12, 31, 501, 123, 320, 132])); // calling the method created
        let webAssEndTime = new Date().getTime();
        console.log(result); // np.array(b) * np.array(value)

        // ****
        // The code below uses RabbitMQ or ZeroMQ through the ./numpy.js file
        // ****
        let MQStartTime = new Date().getTime();

        let arr = await npMQ.arange(10, 10240, 2);
        let max = await npMQ.max(arr);
        let sum = await npMQ.sum(arr);
        let std = await npMQ.std(arr);
        let min = await npMQ.min(arr);
        let mean = await npMQ.mean(arr);
        // let train = await np.train(100); // for real-time example
        console.log(`max -> ${max}`);
        console.log(`min -> ${min}`);
        console.log(`sum -> ${sum}`);
        console.log(`std -> ${std}`);
        console.log(`mean -> ${mean}`);
        console.log(`arange array length -> ${arr.length}`);
    } catch(e) {
        console.error(e);
    }
    let MQEndTime = new Date().getTime();
    console.log(`It took ${(webAssEndTime - webAssStartTime) / 1000}s for the webassembly code to finish`);
    console.log(`It took ${(MQEndTime - MQStartTime) / 1000}s for the zeroMQ code to finish`);
    process.exit(0);
}
init();

```

#### Output
```
[1] arange array length -> 5115
[1] [ 30.74899289076489,
[1]   1458.942776232,
[1]   132.41982605483526,
[1]   773.7870067321069,
[1]   2499.387331589743,
[1]   69308.11563852776,
[1]   13194.818044723062,
[1]   40958.479026581495,
[1]   14354.043485753773 ]
[1] max -> 10238
[1] min -> 10
[1] sum -> 26209260
[1] std -> 2953
[1] mean -> 5124
[1] arange array length -> 5115
[1] It took 0.011s for the webassembly code to finish
[1] It took 0.392s for the zeroMQ code to finish
```
It is faster using webassembly `0.011s`