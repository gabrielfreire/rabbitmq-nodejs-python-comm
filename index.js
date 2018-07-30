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
        let MQEndTime = new Date().getTime();
        console.log(`It took ${(webAssEndTime - webAssStartTime) / 1000}s for the webassembly code to finish`);
        console.log(`It took ${(MQEndTime - MQStartTime) / 1000}s for the zeroMQ code to finish`);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
init();
