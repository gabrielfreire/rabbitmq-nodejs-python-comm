const pyodideNode = require('./PyodideNode/PyodideNode');

class Numpy {
    constructor() {
        this.testNumpy = null;
        this.pyodide = null;
    }
    
    async init() {
        await pyodideNode.loadLanguage();
        console.log('Python was loaded');
        const pyodide = pyodideNode.getModule();
        this.pyodide = pyodide;
        await pyodide.loadPackage('numpy');
        pyodide.runPython('import numpy as np');
        console.log('Numpy was loaded');
    }
    createMethod(options){
        let code = options.code;
        let methodName = options.name;
        this.pyodide.runPython(code);
        return this.pyodide.pyimport(methodName);
    }
    execLine(code) {
        return this.pyodide.runPython(code);
    }
}
module.exports = Numpy;