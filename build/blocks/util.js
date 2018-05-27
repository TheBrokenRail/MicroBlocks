const util = {};
util.typeList = [];
util.extensions_ = [];
util.createType_ = type => {
  util.typeList.push(type);
  Blockly.Blocks[type] = {
    init: function () {
      this.jsonInit({
        type: type,
        message0: type,
        output: 'C++Type',
        colour: 160
      });
    }
  };
  let block = document.createElement('BLOCK');
  block.setAttribute('type', type);
  return block;
};
util.loadExtension = name => {
  let xhttp = new XMLHttpRequest();
  xhttp.addEventListener('load', () => {
    let extension = JSON.parse(xhttp.responseText);
    let category = document.createElement('CATEGORY');
    category.setAttribute('name', extension.name);
    for (let x in extension.types) {
      category.appendChild(util.createType_(x));
      category.appendChild(util.createType_(x + '*'));
      category.appendChild(util.createType_(x + '[]'));
    }
    util.extensions_.push(category);
    if (window.workspace) {
      let toolbox = document.getElementById('toolbox').cloneNode(true);
      for (let i = 0; i < util.extensions_.length; i++) {
        toolbox.appendChild(util.extensions_[i]);
      }
      window.workspace.updateToolbox(toolbox);
    }
  });
  xhttp.open('GET', 'blocks/' + name + '.json');
  xhttp.send();
};
