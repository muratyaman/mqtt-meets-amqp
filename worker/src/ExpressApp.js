const express = require('express');

function makeExpressApp(config) {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.send(config);
  });

  return app;
}

module.exports = {
  makeExpressApp,
};
