from urllib.parse import urlparse
import pika
import os
import numpy as np
import json

def define_connection(url):
    # Needs to install RabbitMQ first
    params = pika.ConnectionParameters(host=url.hostname, virtual_host=url.path[1:], credentials=pika.PlainCredentials(url.username, url.password))
    connection = pika.BlockingConnection(params)
    return connection

def setup_channel(conn, queues):
    channel = connection.channel()
    for q in queues:
        channel.queue_declare(queue=q)
    return channel

def handle_delivery(ch, method, properties, body):
    '''
        Data Message Delivery function
        Example of input from NodeJS
        requestParams = json.loads(body.decode('utf-8'))
        funds = int(requestParams[0])
        size = int(requestParams[1])
        count = int(requestParams[2])
        sims = int(requestParams[3])
    '''
    requestParams = json.loads(body.decode('utf-8'))
    if requestParams['action'] == 'sum':
        results = {}
        results['data'] = int(np.sum(requestParams['data']))
    elif requestParams['action'] == 'max':
        results = {}
        results['data'] = int(np.max(requestParams['data']))
    elif requestParams['action'] == 'min':
        results = {}
        results['data'] = int(np.min(requestParams['data']))
    elif requestParams['action'] == 'std':
        results = {}
        results['data'] = int(np.std(requestParams['data']))
    elif requestParams['action'] == 'mean':
        results = {}
        results['data'] = int(np.mean(requestParams['data']))

    # send a message back
    ch.basic_publish(exchange='',
                          routing_key='results',
                          body=json.dumps(results, ensure_ascii=False))

    # connection.close()


url_str = os.environ.get('CLOUDAMQP_URL', 'amqp://guest:guest@localhost//')
url = urlparse(url_str)

connection = define_connection(url)
channel = setup_channel(connection, ['compute', 'results'])

#  receive message and complete computation
channel.basic_consume(handle_delivery,
              queue='compute',
              no_ack=True)
channel.start_consuming()