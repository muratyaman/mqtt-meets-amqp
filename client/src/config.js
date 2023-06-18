require('dotenv').config();

function makeConfig(penv = process.env) {
  let {
    HTTP_PORT      = '11000',
    MQTT_URL       = 'mqtt://127.0.0.1:1883',
    MQTT_CLIENT_ID = 'user1',
  } = penv;

  HTTP_PORT = parseInt(HTTP_PORT, 10);

  return {
    HTTP_PORT,
    MQTT_URL,
    MQTT_CLIENT_ID,
    MQTT_TOPICS: ['text'].map(cmd => `to/${MQTT_CLIENT_ID}/${cmd}`),
  }
}

module.exports = {
  makeConfig,
};
