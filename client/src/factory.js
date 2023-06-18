const { makeConfig } = require('./config');
const { makeExpressApp } = require('./ExpressApp');
const { MqttClient } = require('./MqttClient');

async function factory() {

  const config     = makeConfig();
  const mqttClient = new MqttClient(config);
  const app        = makeExpressApp(config, mqttClient);

  return {
    app,
    config,
    mqttClient,
  };
}

module.exports = {
  factory,
};
