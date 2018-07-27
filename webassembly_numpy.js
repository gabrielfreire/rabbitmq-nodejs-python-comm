const pyodideNode = require('./PyodideNode/PyodideNode');

class Numpy {
    constructor() {
        this.testNumpy = null;
        
    }
    
    async init() {
        await pyodideNode.loadLanguage();
        console.log('Python was loaded');
        const pyodide = pyodideNode.getModule();
        await pyodide.loadPackage('numpy');
        pyodide.runPython('import numpy as np');
        pyodide.runPython(this._testNumpy());
        this.testNumpy = pyodide.pyimport('test_numpy');
        console.log('Numpy was loaded');
    }
    _testNumpy() {
        return `def test_numpy():
        arr = np.arange(10, 10240, 2)
        print(arr)
        print(np.max(arr))
        print(np.sum(arr))
        print(np.std(arr))
        print(np.min(arr))
        print(np.mean(arr))
        `
    }
}
module.exports = Numpy;