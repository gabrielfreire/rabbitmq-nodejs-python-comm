const Numpy = require('./webassembly_numpy'); // webassembly
// const Numpy = require('./numpy'); // RABBITMQ / ZEROMQ
const np = new Numpy();
async function init() {
    await np.init(); // webassembly
    let startTime = new Date().getTime();
    try {
        np.testNumpy(); // webassembly
        // let arr = await np.arange(10, 10240, 2);
        // let max = await np.max(arr);
        // let sum = await np.sum(arr);
        // let std = await np.std(arr);
        // let min = await np.min(arr);
        // let mean = await np.mean(arr);
        // // let train = await np.train(100); // for real-time example
        // console.log(`max -> ${max}`);
        // console.log(`min -> ${min}`);
        // console.log(`sum -> ${sum}`);
        // console.log(`std -> ${std}`);
        // console.log(`mean -> ${mean}`);
        // console.log(`arange array length -> ${arr.length}`);
    } catch(e) {
        console.error(e);
    }
    let endTime = new Date().getTime();
    console.log(`It took ${(endTime - startTime) / 1000}s`);
    process.exit(0);
}
init();
