const express = require('express');

function makeExpressApp(config) {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json(config);
  });

  return app;
}

module.exports = {
  makeExpressApp,
};
