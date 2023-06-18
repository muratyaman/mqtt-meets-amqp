require('dotenv').config();

function makeConfig(penv = process.env) {
  let {
    HTTP_PORT = '8080',
    MQTT_PORT = '1883',
    AMQP_URL = 'amqp://guest:guest@127.0.0.1:5672/',
  } = penv;

  HTTP_PORT = parseInt(HTTP_PORT, 10);
  MQTT_PORT = parseInt(MQTT_PORT, 10);

  return {
    HTTP_PORT,
    MQTT_PORT,
    AMQP_URL,
  }
}

module.exports = {
  makeConfig,
};

