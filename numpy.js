/**
 * Numpy wrapper
 */
const AMQWrap = require('./rabbit');
const ZMQWrap = require('./zeromq');
class Numpy {
    constructor(){
        // this.wrap = new AMQWrap(); // RabbitMQ wrapper
        this.wrap = new ZMQWrap(); // ZeroMQ wrapper
    }

    async max(ndarray){
        const input = { type: 'max', data: ndarray };
        return await this._wrap(input);
    }
    async min(ndarray){
        const input = { type: 'min', data: ndarray };
        return await this._wrap(input);
    }
    async mean(ndarray){
        const input = { type: 'mean', data: ndarray };
        return await this._wrap(input);
    }
    async std(ndarray){
        const input = { type: 'std', data: ndarray };
        return await this._wrap(input);
    }
    async sum(ndarray){
        const input = { type: 'sum', data: ndarray };
        return await this._wrap(input);
    }
    async arange(start, stop = null, step = null, dtype = null){
        if(!start) throw { error: 'Start argument is required' };
        const input = { type: 'arange', data: { start: start, stop: stop, step: step, dtype: dtype } };
        return await this._wrap(input);
    }

    async _wrap(input) {
        return new Promise(async (resolve, reject) => {
            try{
                let result = await this.wrap.exec(input);
                resolve(result.data);
            } catch(e) {
                reject({ error: e });
            }
        });
    }
}

module.exports = Numpy;