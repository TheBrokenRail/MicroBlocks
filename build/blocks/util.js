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
      for (let y in extension.types[x]) {
        let messages = {};
        messages.message0 = '%1.' + y;
        messages.args0 = [
          {
            type: 'input_value',
            name: 'OBJ',
            check: x
          }
        ];
        let num = 1;
        for (let n = 0; n < extension.types[x][y].args.length; n++) {
          messages['message' + (n + 1)] = extension.types[x][y].args[n].name + ':%1';
          messages['args' + (n + 1)] = [
            {
              type: 'input_value',
              name: 'ARGS' + n,
              check: extension.types[x][y].args[n].type
            }
          ];
        }
        console.log(messages);
        Blockly.Blocks[x + '&&' + y] = {
          init: function () {
            this.jsonInit(Object.assign({
              type: x + '&&' + y,
              output: extension.types[x][y].output,
              colour: 160,
              inputsInline: false
            }, messages));
          }
        };
        let block = document.createElement('BLOCK');
        block.setAttribute('type', x + '&&' + y);
        category.appendChild(block);
      }
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
