const mqtt = require('mqtt');

class MqttClient {

  constructor(config) {
    this.config = config;
    this._client = mqtt.connect(config.MQTT_URL, {
      clientId: config.MQTT_CLIENT_ID,
    });

    this._client.on('connect', this.onConnect.bind(this));
    this._client.on('message', this.onMessage.bind(this));
  }

  onConnect() {
    this._client.subscribe(this.config.MQTT_TOPICS, { qos: 1 }, (err) => {
      if (err) {
        console.error('error subscribing to topic', err);
      } else {
        console.info('subscribed to topics', this.config.MQTT_TOPICS);
      }
    });
    this.publishTimer();
  }

  publishTimer() {
    const topic = `from/${this.config.MQTT_CLIENT_ID}/timer`;
    const payload = { ts: new Date().toISOString() };
    this._client.publish(topic, JSON.stringify(payload), { qos: 1 });
  }

  onMessage(topic, messageBuffer) {
    const payload = JSON.parse(messageBuffer.toString());
    console.log('MQTT: message', { topic, payload });
  }

}

module.exports = {
  MqttClient,
};
