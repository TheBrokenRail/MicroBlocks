const fs = require('fs');
const webpack = require('webpack')(require('./webpack.config.js'));
const ncp = require('ncp').ncp;
const express = require('express');
const rimraf = require('rimraf');
const app = express();

app.use('/editor', express.static('dist'));
app.use('/extensions', express.static('extensions'));
let firstTime = true;
if (fs.existsSync('dist/')) {
  rimraf.sync('dist');
}
fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', fs.readFileSync('src/index.html'));
webpack.watch({}, (err, stats) => {
  if (err) {
    throw err;
  }
  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
  if (firstTime) {
    ncp('node_modules/blockly/media', 'dist/media', ncpErr => {
      if (ncpErr) {
        throw ncpErr;
      }
      app.listen(80, () => console.log('MicroBlocks listening on port 80'));
    });
    firstTime = false;
  }
});
