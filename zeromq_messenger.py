import zmq
import numpy as np
import json
import signal
import os
import time

responder_url = 'tcp://*:5563'
publisher_url = 'tcp://*:5562'
context = zmq.Context()
# responder
socket = context.socket(zmq.REP)
socket.bind(responder_url)
# publisher
publisher = context.socket(zmq.PUB)
publisher.bind(publisher_url)

try:
    while True:
        body = socket.recv()
        requestParams = json.loads(body.decode('utf-8'))

        if requestParams['type'] == 'sum':
            results = {}
            results['data'] = int(np.sum(requestParams['data']))
        elif requestParams['type'] == 'max':
            results = {}
            results['data'] = int(np.max(requestParams['data']))
        elif requestParams['type'] == 'min':
            results = {}
            results['data'] = int(np.min(requestParams['data']))
        elif requestParams['type'] == 'std':
            results = {}
            results['data'] = int(np.std(requestParams['data']))
        elif requestParams['type'] == 'mean':
            results = {}
            results['data'] = int(np.mean(requestParams['data']))
        elif requestParams['type'] == 'train':
            epochs = int(requestParams['epochs'])
            results = {}
            results['data'] = {}
            for i in range(epochs):
                print('Epoch {}'.format(i))
                results['data']['epoch'] = i
                publisher.send_string(json.dumps(results, ensure_ascii=True))
                time.sleep(1)
        elif requestParams['type'] == 'arange':
            results = {}
            start = requestParams['data']['start']
            stop = requestParams['data']['stop']
            step = requestParams['data']['step']
            dtype = requestParams['data']['dtype']
            results['data'] = np.arange(start, stop, step, dtype=dtype).tolist()

        socket.send_string(json.dumps(results, ensure_ascii=False))
except KeyboardInterrupt:
    print('Interrupted')
finally:
    socket.close()
    context.term()