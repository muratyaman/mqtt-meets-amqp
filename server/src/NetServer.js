const { createServer } = require('net');

class NetServer {
  constructor(config, mqttServer) {
    this.config = config;
    this._server = createServer(mqttServer._server.handle);
  }

  listen(cb) {
    return this._server.listen(this.config.MQTT_PORT, cb);
  }
}

module.exports = {
  NetServer,
};
