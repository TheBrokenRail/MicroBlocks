const fs = require('fs');
const webpack = require('webpack')(require('./webpack.config.js'));
const ncp = require('ncp').ncp;
const express = require('express');
const app = express();

app.use('/editor', express.static('dist'));
app.use('/extensions', express.static('extensions'));
webpack.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  if (err) {
    throw err;
  }
  console.log(stats);
  ncp('node_modules/blockly/media', 'dist/media', ncpErr => {
    if (ncpErr) {
      throw ncpErr;
    }
    app.listen(80, () => console.log('MicroBlocks listening on port 80'));
  });
});
