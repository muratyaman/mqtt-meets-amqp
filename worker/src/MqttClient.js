const { randomUUID } = require('crypto');
const mqtt = require('mqtt');

class MqttClient {

  constructor(config, amqpClient) {
    this.config = config;
    this.amqpClient = amqpClient;

    this._client = mqtt.connect(config.MQTT_URL, {
      clientId: config.MQTT_CLIENT_ID,
    });

    this._client.on('connect', this.onConnect.bind(this));
    this._client.on('message', this.onMessage.bind(this));
  }

  onConnect() {
    this._client.subscribe(this.config.MQTT_TOPIC, { qos: 1 }, (err) => {
      if (err) {
        console.error('error subscribing to topic', err);
      } else {
        console.info('subscribed to topic', this.config.MQTT_TOPIC);
      }
    });
  }

  onMessage(topic, messageBuffer) {
    const payload = JSON.parse(messageBuffer.toString());
    console.log('MQTT: message received', { topic, payload });

    // extract pieces from 'from/user1/text'
    const [_from, fromUser, cmd] = topic.split('/');
    let queueName = '', queuePayload = {};

    switch (cmd) {
      case 'text':
        queueName = `to.${payload.to}.text`;
        const { text, ts = new Date(), id = randomUUID() } = payload;
        queuePayload = { from: fromUser, text, ts, id };
        this.amqpClient.sendToQueue(queueName, queuePayload);
        break;
    }

  }

}

module.exports = {
  MqttClient,
};
