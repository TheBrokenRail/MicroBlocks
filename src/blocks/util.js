import parser from 'fast-xml-parser';
import Blockly from '../blockly';
import BlocklyData from '../blockly-data';

const util = {};
util.getName = null;
util.setName = null;
util.getExtensionList = null;
util.setExtensionList = null;
util.addExtension = null;
util.setData_ = data => {
  util.getName = () => {
    return data.getName() || data.getName().length < 1 ? data.getName() : 'Untitled';
  };
  util.setName = data.setName;
  util.getExtensionList = data.getExtensionList;
  util.setExtensionList = data.setExtensionList;
  util.addExtension = data.addExtension;
}
util.blockGenerators_ = [];
util.workspace = null;
util.reset_ = () => {
  Blockly.Blocks = {};
  for (let i = 0; i < util.blockGenerators_.length; i++) {
    util.blockGenerators_[i]();
  }
  util.typeList = [];
  util.extensions_ = [];
  util.includes_ = [];
  util.modules_ = {};
  util.operators = {
    '+': {},
    '-': {},
    '*': {},
    '/': {},
    '<<': {},
    '>>': {},
    '[]': {}
  };
  util.typeCast_ = {MISSING_TYPE: []};
};
util.save = () => {
  let name = util.getName();
  let project = {};
  project.extensions = util.getExtensionList();
  project.name = name;
  let xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(util.workspace));
  project.blocks = parser.parse(xml, {ignoreAttributes: false});
  return JSON.stringify(project, null, 4);
};
util.load = data => {
  try {
    util.workspace.clear();
    let project = JSON.parse(data);
    util.setExtensionList(project.extensions);
    util.loadExtensions(util.getExtensionList(), () => {
      util.setName(project.name);
      let xmlParser = new parser.j2xParser({ignoreAttributes: false});
      let xml = Blockly.Xml.textToDom(xmlParser.parse(project.blocks));
      Blockly.Xml.domToWorkspace(xml, util.workspace);
    });
  } catch (e) {
    document.getElementById('name').value = 'Untitled';
    workspace.clear();
    Blockly.Xml.domToWorkspace(document.getElementById('workspace'), workspace);
    alert('Error: Invalid or Corrupt File');
    throw 'Invalid or Corrupt File';
  }
}
util.createType_ = (type, prefix, colour) => {
  util.typeList.push(type + prefix);
  Blockly.Blocks[type + prefix] = {
    init: function () {
      this.jsonInit({
        type: type + prefix,
        message0: type + prefix,
        output: 'C++Type',
        colour: colour
      });
    },
    baseType: type
  };
  Blockly.JavaScript[type + prefix] = function () {
    return [type + prefix];
  };
  let block = document.createElement('BLOCK');
  block.setAttribute('type', type + prefix);
  return block;
};
util.loadExtension = (name, reload, callback) => {
  let xhttp = new XMLHttpRequest();
  xhttp.addEventListener('load', () => {
    let extension = JSON.parse(xhttp.responseText);
    let category = document.createElement('CATEGORY');
    category.setAttribute('name', extension.name);
    category.setAttribute('colour', extension.colour);
    for (let x in extension.types) {
      category.appendChild(util.createType_(x, '', extension.colour));
      category.appendChild(util.createType_(x, '*', extension.colour));
      category.appendChild(util.createType_(x, '[]', extension.colour));
      category.appendChild(util.createType_(x, '*[]', extension.colour));
      let typeAppends = ['', '*', '[]', '*[]'];
      for (let i = 0; i < typeAppends.length; i++) {
        for (let y in util.operators) {
          if (extension.operators && extension.operators[y] && extension.operators[y][x + typeAppends[i]]) {
            util.operators[y][x + typeAppends[i]] = extension.operators[y][x + typeAppends[i]];
          } else {
            util.operators[y][x + typeAppends[i]] = {output: x + typeAppends[i], check: y !== '[]' ? x + typeAppends[i] : 'int'};
          }
        }
      }
      if (extension.types[x].cast) {
        util.typeCast_[x] = extension.types[x].cast;
      } else {
        util.typeCast_[x] = [];
      }
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
              check: [x, x + '*', x + '[]'].concat(util.typeCast_[x])
            }
          ];
        }
        for (let n = 0; n < extension.types[x].methods[y].args.length; n++) {
          messages['message' + (constructor ? n + 1 : n + 2)] = extension.types[x].methods[y].args[n].name + ':%1';
          messages['args' + (constructor ? n + 1 : n + 2)] = [
            {
              type: 'input_value',
              name: 'ARG' + n,
              check: [extension.types[x].methods[y].args[n].type].concat(util.typeCast_[extension.types[x].methods[y].args[n].type])
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
                  check: [x].concat(util.typeCast_[x])
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
            check: [extension.methods[x].args[n].type].concat(util.typeCast_[extension.methods[x].args[n].type])
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
    util.includes_ = util.includes_.concat(extension.includes ? extension.includes : []);
    util.extensions_.push(category);
    if (util.workspace && reload) {
      let toolbox = BlocklyData.toolbox.cloneNode(true);
      for (let i = 0; i < util.extensions_.length; i++) {
        toolbox.appendChild(util.extensions_[i]);
      }
      util.workspace.updateToolbox(toolbox);
      if (callback) {
        callback();
      }
    } else {
      if (callback) {
        callback();
      }
    }
  });
  xhttp.open('GET', '/extensions/' + name + '.json');
  xhttp.send();
};
util.loadExtensions = (list, callback) => {
  util.reset_();
  let done = 0;
  for (let i = 0; i < list.length; i++) {
    util.loadExtension(list[i], false, () => {
      done++;
      if (done === list.length) {
        if (util.workspace) {
          let toolbox = BlocklyData.toolbox.cloneNode(true);
          for (let i = 0; i < util.extensions_.length; i++) {
            toolbox.appendChild(util.extensions_[i]);
          }
          util.workspace.updateToolbox(toolbox);
          callback();
        }
      }
    });
  }
};
util.generate = workspace => {
  return util.includes_.join('\n') + '\n\n' + Blockly.JavaScript.workspaceToCode(workspace);
};

export default util;
