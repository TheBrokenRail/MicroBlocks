util.blockGenerators_.push(() => {
  Blockly.Blocks['&&methods_def'] = {
    init: function () {
      let nameField = new Blockly.FieldTextInput('', this.updateParams_.bind(this));
      nameField.setSpellcheck(false);
      this.appendDummyInput()
          .appendField('define');
      this.appendValueInput('TYPE')
          .setCheck('C++Type');
      this.appendDummyInput()
          .appendField(nameField, 'NAME')
          .appendField('', 'PARAMS');
      this.setMutator(new Blockly.Mutator(['&&methods_mutatorarg'].concat(util.typeList)));
      this.setColour(210);
      this.arguments_ = [];
      this.appendStatementInput('STACK');
      this.bad_ = false;
    },
    updateParams_: function () {
      let badArg = [];
      let hash = {};
      for (let i = 0; i < this.arguments_.length; i++) {
        if (hash['arg_' + this.arguments_[i].name]) {
          badArg.push('Duplicated "' + this.arguments_[i].name + '" Arguments!');
        }
        if (this.arguments_[i].name.indexOf(' ') !== -1) {
          badArg.push('Argument "' + this.arguments_[i].name + '" Has Spaces!');
        }
        if (this.arguments_[i].name.length < 1) {
          badArg.push('Argument ' + (i + 1) + ' Has No Name!');
        }
        if (badArg.length > 0) {
          break;
        }
        hash['arg_' + this.arguments_[i].name] = true;
      }
      if (this.getProcedureDef()[1].length < 1) {
        badArg.push('This Procedure Doesn\'t Have A Name!');
      }
      if (this.getProcedureDef()[1].indexOf(' ') !== -1) {
        badArg.push('This Procedure Has Spaces In Its Name!');
      }
      if (badArg.length > 0) {
        this.setWarningText(badArg.join('\n'));
        this.bad_ = true;
      } else {
        this.setWarningText(null);
        this.bad_ = false;
      }
      let paramString = '';
      if (this.arguments_.length) {
        let param = [];
        for (let i = 0; i < this.arguments_.length; i++) {
          param.push(this.arguments_[i].type + ' ' + this.arguments_[i].name);
        }
        paramString = 'With:' +
            ' ' + param.join(', ');
      }
      Blockly.Events.disable();
      try {
        this.setFieldValue(paramString, 'PARAMS');
      } finally {
        Blockly.Events.enable();
      }
    },
    mutationToDom: function (opt_paramIds) {
      let container = document.createElement('mutation');
      container.setAttribute('name', this.getFieldValue('NAME'));
      for (let i = 0; i < this.arguments_.length; i++) {
        let parameter = document.createElement('arg');
        let arg = this.arguments_[i];
        parameter.setAttribute('name', arg.name);
        parameter.setAttribute('type', arg.type);
        container.appendChild(parameter);
      }
      return container;
    },
    domToMutation: function (xmlElement) {
      this.arguments_ = [];
      for (let i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
        if (childNode.nodeName.toLowerCase() == 'arg') {
          let argName = childNode.getAttribute('name');
          let argType = childNode.getAttribute('type');
          this.arguments_.push({name: argName, type: argType});
        }
      }
      this.getField('NAME').setText(xmlElement.getAttribute('name'));
      this.updateParams_();
    },
    decompose: function (workspace) {
      let containerBlock = workspace.newBlock('&&methods_mutatorcontainer');
      containerBlock.initSvg();
      let connection = containerBlock.getInput('STACK').connection;
      for (let i = 0; i < this.arguments_.length; i++) {
        let paramBlock = workspace.newBlock('&&methods_mutatorarg');
        paramBlock.initSvg();
        if (Blockly.Blocks[this.arguments_[i].type]) {
          let typeBlock = workspace.newBlock(this.arguments_[i].type);
          typeBlock.initSvg();
          paramBlock.getInput('TYPE').connection.connect(typeBlock.outputConnection);
        }
        paramBlock.setFieldValue(this.arguments_[i].name, 'NAME');
        connection.connect(paramBlock.previousConnection);
        connection = paramBlock.nextConnection;
      }
      return containerBlock;
    },
    compose: function (containerBlock) {
      this.arguments_ = [];
      let paramBlock = containerBlock.getInputTargetBlock('STACK');
      while (paramBlock) {
        let argName = paramBlock.getFieldValue('NAME');
        let argType = paramBlock.getInputTargetBlock('TYPE') ? paramBlock.getInputTargetBlock('TYPE').type : 'MISSING_TYPE';
        this.arguments_.push({name: argName, type: argType});
        paramBlock = paramBlock.nextConnection &&
            paramBlock.nextConnection.targetBlock();
      }
      this.updateParams_();
    },
    getProcedureDef: function () {
      return [(this.getInputTargetBlock('TYPE') ? this.getInputTargetBlock('TYPE').type : 'MISSING_TYPE'), this.getFieldValue('NAME'), false, this.arguments_, this.bad_];
    },
    getVar: function () {
      return this.arguments_;
    },
    callType_: '&&methods_call'
  };

  Blockly.JavaScript['&&methods_def'] = function (block) {
    let args = [];
    for (let i = 0; i < block.getProcedureDef()[3]; i++) {
      args.push(block.getProcedureDef()[3][i].type + ' ' + block.getProcedureDef()[3][i].name);
    }
    return block.getProcedureDef()[0] + ' ' + block.getProcedureDef()[1] + '(' + args.join(',') + ') {\n' + Blockly.JavaScript.statementToCode(block, 'STACK') + '}\n';
  };

  Blockly.Blocks['&&methods_mutatorcontainer'] = {
    /**
     * Mutator block for procedure container.
     * @this Blockly.Block
     */
    init: function () {
      this.appendDummyInput()
          .appendField('Arguments');
      this.appendStatementInput('STACK');
      this.setColour(210);
      this.contextMenu = false;
    }
  };

  Blockly.Blocks['&&methods_mutatorarg'] = {
    /**
     * Mutator block for procedure argument.
     * @this Blockly.Block
     */
    init: function () {
      let field = new Blockly.FieldTextInput('arg');
      this.appendDummyInput()
          .appendField('Argument');
      this.appendValueInput('TYPE')
          .setCheck('C++Type');
      this.appendDummyInput()
          .appendField(field, 'NAME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(210);
      this.contextMenu = false;
    }
  };

  Blockly.Blocks['&&methods_call'] = {
    init: function () {
      this.appendDummyInput('TOPROW')
          .appendField(this.id, 'NAME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(210);
      this.arguments_ = [];
      this.type_ = '';
      this.output_ = false;
    },
    setArguments: function (type, name) {
      if (this.output_) {
        this.setOutput(type);
      }
      let list = Blockly.Procedures.allProcedures(workspace)[0];
      for (let i = 0; i < list.length; i++) {
        if (list[i][0] === type && list[i][1] === name) {
          this.arguments_ = list[i][3];
        }
      }
    },
    getProcedureCall: function () {
      return [this.getFieldValue('NAME'), this.type_];
    },
    renameProcedure: function (oldName, newName) {
      if (Blockly.Names.equals(oldName, this.getProcedureCall()[0])) {
        this.setFieldValue(newName, 'NAME');
      }
    },
    setProcedureParameters_: function () {
      let savedRendered = this.rendered;
      this.rendered = false;
      let quark = {};
      for (let i = 0; i < this.arguments_.length; i++) {
        let input = this.getInput('ARG' + i);
        if (input) {
          let connection = input.connection.targetConnection;
          quark[i] = connection;
          if (connection) {
            connection.disconnect();
            connection.getSourceBlock().bumpNeighbours_();
          }
        }
      }
      this.updateShape_();
      for (let i = 0; i < this.arguments_.length; i++) {
        if (quark[i]) {
          let connection = quark[i];
          if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
            delete this.quarkConnections_[quarkId];
          }
        }
      }
      this.rendered = savedRendered;
      if (this.rendered) {
        this.render();
      }
    },
    updateShape_: function () {
      this.setArguments(this.getProcedureCall()[1], this.getProcedureCall()[0]);
      let i = null;
      for (i = 0; i < this.arguments_.length; i++) {
        let field = this.getField('ARGNAME' + i);
        if (field) {
          Blockly.Events.disable();
          try {
            field.setValue(this.arguments_[i].name + ':');
          } finally {
            Blockly.Events.enable();
          }
        } else {
          field = new Blockly.FieldLabel(this.arguments_[i].name);
          let input = this.appendValueInput('ARG' + i)
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField(field, 'ARGNAME' + i)
              .setCheck(this.arguments_[i].type);
          input.init();
        }
      }
      while (this.getInput('ARG' + i)) {
        this.removeInput('ARG' + i);
        i++;
      }
    },
    mutationToDom: function () {
      let container = document.createElement('mutation');
      container.setAttribute('name', this.getProcedureCall()[0]);
      container.setAttribute('type', this.getProcedureCall()[1]);
      return container;
    },
    domToMutation: function (xmlElement) {
      let name = xmlElement.getAttribute('name');
      this.type_ = xmlElement.getAttribute('type');
      this.renameProcedure(this.getProcedureCall()[0], name);
      this.setProcedureParameters_();
    },
    onchange: function (event) {
      if (!this.workspace || this.workspace.isFlyout) {
        return;
      }
    },
    defType_: '&&methods_def'
  };

  Blockly.JavaScript['&&methods_call'] = function (block) {
    let args = [];
    for (let i = 0; i < block.arguments_.length; i++) {
      args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
    }
    return block.getProcedureCall()[0] + '(' + args.join(',') + ');\n';
  };


  Blockly.Blocks['&&methods_call_output'] = {
    init: function () {
      this.appendDummyInput('TOPROW')
          .appendField(this.id, 'NAME');
      this.setOutput('MISSING_TYPE');
      this.setColour(210);
      this.arguments_ = [];
      this.type_ = '';
      this.output_ = true;
    },
    setArguments: Blockly.Blocks['&&methods_call'].setArguments,
    getProcedureCall: Blockly.Blocks['&&methods_call'].getProcedureCall,
    renameProcedure: Blockly.Blocks['&&methods_call'].renameProcedure,
    setProcedureParameters_: Blockly.Blocks['&&methods_call'].setProcedureParameters_,
    updateShape_: Blockly.Blocks['&&methods_call'].updateShape_,
    mutationToDom: Blockly.Blocks['&&methods_call'].mutationToDom,
    domToMutation: Blockly.Blocks['&&methods_call'].domToMutation,
    onchange: Blockly.Blocks['&&methods_call'].onchange,
    defType_: '&&methods_def'
  };

  Blockly.JavaScript['&&methods_call_output'] = function (block) {
    let args = [];
    for (let i = 0; i < block.arguments_.length; i++) {
      args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i));
    }
    return [block.getProcedureCall()[0] + '(' + args.join(',') + ')'];
  };

  Blockly.Blocks['&&methods_return'] = {
    init: function () {
      this.appendValueInput('VALUE')
          .appendField('return');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(210);
    }
  };

  Blockly.JavaScript['&&methods_return'] = function (block) {
    return 'return ' + Blockly.JavaScript.valueToCode('VALUE') + ';\n';
  };

  const methodsCallback = workspace => {
    let xmlList = [];
    if (Blockly.Blocks['&&methods_def']) {
      let block = document.createElement('block');
      block.setAttribute('type', '&&methods_def');
      let nameField = document.createElement('field');
      nameField.setAttribute('NAME', '');
      block.appendChild(nameField);
      xmlList.push(block);
    }
    if (Blockly.Blocks['&&methods_return']) {
      var block = document.createElement('block');
      block.setAttribute('type', '&&methods_return');
      xmlList.push(block);
    }
    if (xmlList.length) {
      xmlList[xmlList.length - 1].setAttribute('gap', 24);
    }
    function populateProcedures(procedureList, templateName) {
      for (let i = 0; i < procedureList.length; i++) {
        if (procedureList[i][4]) {
          continue;
        }
        let type = procedureList[i][0];
        let name = procedureList[i][1];
        let args = procedureList[i][3];
        let block = document.createElement('block');
        block.setAttribute('type', templateName);
        block.setAttribute('gap', 16);
        let mutation = document.createElement('mutation');
        mutation.setAttribute('name', name);
        mutation.setAttribute('type', type);
        block.appendChild(mutation);
        xmlList.push(block);
        if (type !== 'void') {
          let blockOutput = document.createElement('block');
          blockOutput.setAttribute('type', templateName + '_output');
          blockOutput.setAttribute('gap', 16);
          let mutationOutput = document.createElement('mutation');
          mutationOutput.setAttribute('name', name);
          mutationOutput.setAttribute('type', type);
          blockOutput.appendChild(mutationOutput);
          xmlList.push(blockOutput);
        }
      }
    }
    let tuple = Blockly.Procedures.allProcedures(workspace);
    populateProcedures(tuple[0], '&&methods_call');
    return xmlList;
  };
});
