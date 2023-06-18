const { factory } = require('./factory');

main();

async function main() {
  const f = await factory();

  f.app.listen(f.config.HTTP_PORT, () => {
    console.log('HTTP server listening on port', f.config.HTTP_PORT);
  });
}
