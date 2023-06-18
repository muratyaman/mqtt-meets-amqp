const { makeConfig } = require('./config');
const { AmqpClient } = require('./AmqpClient');
const { makeExpressApp } = require('./ExpressApp');
const { MqttClient } = require('./MqttClient');

async function factory() {

  const config     = makeConfig();
  const amqpClient = new AmqpClient(config);
  const mqttClient = new MqttClient(config, amqpClient);
  const app        = makeExpressApp(config, mqttClient);

  return {
    app,
    config,
    amqpClient,
    mqttClient,
  };
}

module.exports = {
  factory,
};
