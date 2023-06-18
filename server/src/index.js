const { factory } = require('./factory');

main();

async function main() {
  const f = await factory();
  
  f.netServer.listen(() => {
    console.info('MQTT server listening on port', f.config.MQTT_PORT);
  });

  f.app.listen(f.config.HTTP_PORT, () => {
    console.info('HTTP server listening on port', f.config.HTTP_PORT);
  });
}
