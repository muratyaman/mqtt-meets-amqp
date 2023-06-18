const express = require('express');

function makeExpressApp(config, mqttClient) {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json(config);
  });

  app.post('/:cmd', (req, res) => {
    const { cmd } = req.params;
    const msg = req.body;
    const topic = `from/${config.MQTT_CLIENT_ID}/${cmd}`;
    mqttClient._client.publish(
      topic,
      JSON.stringify(msg),
      { qos: 1, retain: false },
      (err) => {
        if (err) {
          console.error('error publishing message', err);
        } else {
          console.info('published message', msg, 'to topic', topic);
        }
      }
    );
    res.json({ ok: true });
  });

  return app;
}

module.exports = {
  makeExpressApp,
};
