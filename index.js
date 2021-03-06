const fs = require('fs');
const webpack = require('webpack')(require('./webpack.config.js'));
const ncp = require('ncp').ncp;
const express = require('express');
const rimraf = require('rimraf');
const app = express();
const PORT = process.env.PORT || 80;

app.use('/editor', express.static('dist'));
app.use('/extensions', express.static('extensions'));
app.get('/', (req, res) => res.redirect('/editor'));
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
      app.listen(PORT, () => console.log('MicroBlocks listening on port 80'));
    });
    firstTime = false;
  }
});
