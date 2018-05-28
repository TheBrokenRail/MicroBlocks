const util = {};
util.typeList = [];
util.extensions_ = [];
util.createType_ = (type, colour) => {
  util.typeList.push(type);
  Blockly.Blocks[type] = {
    init: function () {
      this.jsonInit({
        type: type,
        message0: type,
        output: 'C++Type',
        colour: colour
      });
    }
  };
  Blockly.JavaScript[type] = function () {
    return type;
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
    category.setAttribute('colour', extension.colour);
    for (let x in extension.types) {
      category.appendChild(util.createType_(x, extension.colour));
      category.appendChild(util.createType_(x + '*', extension.colour));
      category.appendChild(util.createType_(x + '[]', extension.colour));
      for (let y in extension.types[x].methods) {
        let constructor = x === y;
        let messages = {};
        messages.message0 = y;
        if (!constructor) {
          messages.message1 = x + '%1';
          messages.args1 = [
            {
              type: 'input_value',
              name: 'OBJ',
              check: [x, x + '*', x + '[]'].concat(extension.types[x].methods[x] && extension.types[x].methods[x].cast ? extension.types[x].methods[x].cast : [])
            }
          ];
        }
        for (let n = 0; n < extension.types[x].methods[y].args.length; n++) {
          messages['message' + (constructor ? n + 1 : n + 2)] = extension.types[x].methods[y].args[n].name + ':%1';
          messages['args' + (constructor ? n + 1 : n + 2)] = [
            {
              type: 'input_value',
              name: 'ARG' + n,
              check: extension.types[x].methods[y].args[n].type
            }
          ];
        }
        if (extension.types[x].methods[y].output !== 'void') {
          Blockly.Blocks[x + '&&' + y] = {
            init: function () {
              this.jsonInit(Object.assign({
                type: x + '&&' + y,
                output: extension.types[x].methods[y].output,
                colour: extension.colour,
                inputsInline: false
              }, messages));
            }
          };
          let block = document.createElement('BLOCK');
          block.setAttribute('type', x + '&&' + y);
          category.appendChild(block);
          Blockly.JavaScript[x + '&&' + y] = function (block) {
            let args = [];
            for (let i = 0; i < extension.types[x].methods[y].args.length; i++) {
              args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
            }
            if (constructor) {
              return [x + '(' + args.join(',') + ')'];
            } else {
              return [Blockly.JavaScript.valueToCode(block, 'OBJ') + '.' + y + '(' + args.join(',') + ')'];
            }
          };
        }
        Blockly.Blocks[x + '%%' + y] = {
          init: function () {
            this.jsonInit(Object.assign({
              type: x + '&&' + y,
              nextStatement: null,
              previousStatement: null,
              colour: extension.colour,
              inputsInline: false
            }, messages));
          }
        };
        Blockly.JavaScript[x + '%%' + y] = function (block) {
          let args = [];
          for (let i = 0; i < extension.types[x].methods[y].args.length; i++) {
            args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
          }
          if (constructor) {
            return x + '(' + args.join(',') + ');';
          } else {
            return Blockly.JavaScript.valueToCode(block, 'OBJ') + '.' + y + '(' + args.join(',') + ');\n';
          }
        };
        let block = document.createElement('BLOCK');
        block.setAttribute('type', x + '%%' + y);
        category.appendChild(block);
      }
      for (let y in extension.types[x].properties) {
        Blockly.Blocks[x + '\\\\' + y] = {
          init: function () {
            this.jsonInit({
              type: x + '\\\\' + y,
              message0: '%1.' + y,
              args0: [
                {
                  type: 'input_value',
                  name: 'OBJ',
                  check: x
                }
              ],
              output: extension.types[x].properties[y],
              colour: extension.colour
            });
          }
        };
        let block = document.createElement('BLOCK');
        block.setAttribute('type', x + '\\\\' + y);
        category.appendChild(block);
        Blockly.JavaScript[x + '\\\\' + y] = function (block) {
          return [Blockly.JavaScript.valueToCode(block, 'OBJ') + '.' + y];
        };
      }
    }
    for (let x in extension.methods) {
      let messages = {};
      messages.message0 = x;
      for (let n = 0; n < extension.methods[x].args.length; n++) {
        messages['message' + (n + 1)] = extension.methods[x].args[n].name + ':%1';
        messages['args' + (n + 1)] = [
          {
            type: 'input_value',
            name: 'ARG' + n,
            check: extension.methods[x].args[n].type
          }
        ];
      }
      if (extension.methods[x].output !== 'void') {
        Blockly.Blocks['[]' + x] = {
          init: function () {
            this.jsonInit(Object.assign({
              type: '[]' + x,
              output: extension.methods[x].output,
              colour: extension.colour,
              inputsInline: false
            }, messages));
          }
        };
        let block = document.createElement('BLOCK');
        block.setAttribute('type', '[]' + x);
        category.appendChild(block);
        Blockly.JavaScript['[]' + x] = function (block) {
          let args = [];
          for (let i = 0; i < extension.methods[x].args.length; i++) {
            args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
          }
          return [x + '(' + args.join(',') + ')'];
        };
      }
      Blockly.Blocks['][' + x] = {
        init: function () {
          this.jsonInit(Object.assign({
            type: '][' + x,
            nextStatement: null,
            previousStatement: null,
            colour: extension.colour,
            inputsInline: false
          }, messages));
        }
      };
      Blockly.JavaScript['][' + x] = function (block) {
        let args = [];
        for (let i = 0; i < extension.methods[x].args.length; i++) {
          args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
        }
        return x + '(' + args.join(',') + ');\n';
      };
      let block = document.createElement('BLOCK');
      block.setAttribute('type', '][' + x);
      category.appendChild(block);
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
