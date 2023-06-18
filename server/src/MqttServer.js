const aedes = require('aedes');

class MqttServer {

  constructor(config, amqpClient) {
    this.config = config;
    this.amqpClient = amqpClient;
    this.consumerChannelsByClient = {};

    this._server = aedes({
      // options
    });

    this._server.on('clientError', this.onClientError.bind(this));
    this._server.on('connectionError', this.connectionError.bind(this));
    this._server.on('client', this.onClient.bind(this));
    //this._server.on('publish', this.onPublish.bind(this));
    this._server.on('subscribe', this.onSubscribe.bind(this));
    this._server.on('unsubscribe', this.onUnsubscribe.bind(this));
  }

  setConsumerChannel(client, queueName, consumerChannel) {
    if (!this.consumerChannelsByClient[client.id]) {
      this.consumerChannelsByClient[client.id] = {};
    }
    this.consumerChannelsByClient[client.id][queueName] = consumerChannel;
  }

  async delConsumerChannel(client, queueName) {
    const channelsByQueue = this.consumerChannelsByClient[client.id] || {};
    if (channelsByQueue[queueName]) {
      await channelsByQueue[queueName].close();
      delete this.consumerChannelsByClient[client.id][queueName];
    }
  }

  connectionError(client, err) {
    console.debug('MqttServer: connectionError', client, err.message, err.stack);
  }

  onClientError(err, client) {  
    console.debug('MqttServer: clientError', client.id, err.message, err.stack);
  }

  onClient(client) {
    console.debug('MqttServer: client', client.id);
  }

  _makeQueueNameByTopic(topic) {
    return topic.replace(/\//g, '.');
  }

  // publish message to queue on behalf of client
  // onPublish(packet, client) {
  //   console.debug('MqttServer: publish', client, packet);

  //   const { topic, payload } = packet;
  //   const queueName = this._makeQueueNameByTopic(topic);
  //   const message = payload.toString();

  //   // 'from/user1/text' => 'from.user1.text
  //   this.amqpClient.sendToQueue(queueName, message); // close after done
  // }

  // subscribe client to queue on behalf of client
  async onSubscribe(subscriptions, client) {
    console.debug('MqttServer: subscribe', subscriptions, client.id);
    if (String(client.id).startsWith('worker')) return; // ignore our worker apps

    const that = this; // localise

    for (const subscription of subscriptions) {
      const { topic, qos } = subscription;
      const queueName = that._makeQueueNameByTopic(topic);

      const consumer = (message, channel) => {
        const payload = message.content.toString();
        console.log('MqttServer: subscribe: consumer', payload);
        const packet = { cmd: 'publish', topic, payload, qos, retain: false };
        that._server.publish(packet, (err) => {
          if (err) {
            console.log('MqttServer: subscribe: consumer: publish error', message, err);
          } else {
            console.log('MqttServer: subscribe: consumer: publish success', message);
            channel.ack(message); // ack the message after processing
          }
        });
      }

      // consume the queue and process messages for client's topic
      const consumerChannel = that.amqpClient.listenToQueue(queueName, consumer);
      that.setConsumerChannel(client, queueName, consumerChannel);
    }

  }

  onUnsubscribe(topics, client) {
    console.debug('MqttServer: unsubscribe', topics, client.id);
    if (String(client.id).startsWith('worker')) return; // ignore our worker apps

    for (const topic of topics) {
      const queueName = this._makeQueueNameByTopic(topic);
      this.delConsumerChannel(client, queueName)
        .then(() => {
          console.info('MqttServer: unsubscribe: success', client.id, queueName);
        })
        .catch((err) => {
          console.error('MqttServer: unsubscribe: error', client.id, queueName, err);
        });
    }
  }

}

module.exports = {
  MqttServer,
};
