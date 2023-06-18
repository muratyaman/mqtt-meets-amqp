const { makeConfig } = require('./config');
const { AmqpClient } = require('./AmqpClient');
const { MqttServer } = require('./MqttServer');
const { NetServer } = require('./NetServer');
const { makeExpressApp } = require('./ExpressApp');

async function factory() {
  const config     = makeConfig();
  const app        = makeExpressApp(config);
  const amqpClient = new AmqpClient(config);
  const mqttServer = new MqttServer(config, amqpClient);
  const netServer  = new NetServer(config, mqttServer);

  return {
    app,
    config,
    amqpClient,
    mqttServer,
    netServer,
  };
}

module.exports = {
  factory,
};
