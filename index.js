const fs = require('fs');
const browserify = require('browserify')();
const ncp = require('ncp').ncp;
const express = require('express');
const app = express();

let file = fs.readFileSync('./node_modules/scratch-blocks/javascript_compressed.js', {encoding: "utf8"});
file = 'module.exports = function(Blockly){' + file + '};';
fs.writeFileSync('./node_modules/scratch-blocks/javascript_compressed_nodejs.js', file);
browserify.add('build.js');

app.use('/editor', express.static('build'));
browserify.bundle((err, data) => {
  if (err) {
    throw err;
  }
  fs.writeFileSync('build/bundle.js', data);
  ncp('node_modules/scratch-blocks/media', 'build/media', ncpErr => {
    if (ncpErr) {
      throw ncpErr;
    }
    app.listen(80, () => console.log('MicroBlocks listening on port 80'));
  });
});
