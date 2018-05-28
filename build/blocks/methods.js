Blockly.Blocks['&&methods_def'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function () {
    let nameField = new Blockly.FieldTextInput('');
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
    this.statementConnection_ = null;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function () {
    // Check for duplicated arguments.
    let badArg = false;
    let hash = {};
    for (let i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].name] || this.arguments_[i].name.indexOf(' ') !== -1) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].name] = true;
    }
    if (badArg) {
      this.setWarningText('Bad!');
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    let paramString = '';
    if (this.arguments_.length) {
      let param = [];
      for (let i = 0; i < this.arguments_.length; i++) {
        param.push(this.arguments_[i].type + ' ' + this.arguments_[i].name);
      }
      paramString = 'With:' +
          ' ' + param.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
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
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
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
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function (workspace) {
    let containerBlock = workspace.newBlock('methods_mutatorcontainer');
    containerBlock.initSvg();
    // Parameter list.
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
      // Store the old location.
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function (containerBlock) {
    // Parameter list.
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
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   * @this Blockly.Block
   */
  getProcedureDef: function () {
    return [(this.getInputTargetBlock('TYPE') ? this.getInputTargetBlock('TYPE').type : 'MISSING_TYPE'), this.getFieldValue('NAME'), false, this.arguments_];
  },
  /**
   * Return all letiables referenced by this block.
   * @return {!Array.<string>} List of letiable names.
   * @this Blockly.Block
   */
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
  return block.getProcedureDef()[0] + ' ' + block.getProcedureDef()[1] + '(' + args.join(',') + ') {\n' + Blockly.JavaScript.statementToCode(block, 'STACK') + '\n}';
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
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function () {
    this.appendDummyInput('TOPROW')
        .appendField(this.id, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.arguments_ = [];
    this.type_ = '';
  },
  setArguments: function (type, name) {
    let list = Blockly.Procedures.allProcedures(workspace)[0];
    for (let i = 0; i < list.length; i++) {
      if (list[i][0] === type && list[i][1] === name) {
        this.arguments_ = list[i][3];
      }
    }
  },
  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcedureCall: function () {
    // The NAME field is guaranteed to exist, null will never be returned.
    return [this.getFieldValue('NAME'), this.type_];
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this Blockly.Block
   */
  renameProcedure: function (oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getProcedureCall()[0])) {
      this.setFieldValue(newName, 'NAME');
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this Blockly.Block
   */
  setProcedureParameters_: function () {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    // Switch off rendering while the block is rebuilt.
    let savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    let quark = {};
    for (let i = 0; i < this.arguments_.length; i++) {
      let input = this.getInput('ARG' + i);
      if (input) {
        let connection = input.connection.targetConnection;
        quark[i] = connection;
        if (connection) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours_();
        }
      }
    }
    // Rebuild the block's arguments.
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.arguments_.length; i++) {
      if (quark[i]) {
        let connection = quark[i];
        if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
          // Block no longer exists or has been attached elsewhere.
          delete this.quarkConnections_[quarkId];
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function () {
    this.setArguments(this.getProcedureCall()[1], this.getProcedureCall()[0]);
    let i = null;
    for (i = 0; i < this.arguments_.length; i++) {
      let field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Blockly.Events.disable();
        try {
          field.setValue(this.arguments_[i].name + ':');
        } finally {
          Blockly.Events.enable();
        }
      } else {
        // Add new input.
        field = new Blockly.FieldLabel(this.arguments_[i].name);
        let input = this.appendValueInput('ARG' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(field, 'ARGNAME' + i)
            .setCheck(this.arguments_[i].type);
        input.init();
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ARG' + i)) {
      this.removeInput('ARG' + i);
      i++;
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    let container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall()[0]);
    container.setAttribute('type', this.getProcedureCall()[1]);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    let name = xmlElement.getAttribute('name');
    this.type_ = xmlElement.getAttribute('type');
    this.renameProcedure(this.getProcedureCall()[0], name);
    this.setProcedureParameters_();
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!Blockly.Events.Abstract} event Change event.
   * @this Blockly.Block
   */
  onchange: function (event) {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
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
  return block.getProcedureCall()[0] + '(' + args.join(',') + ');';
};

Blockly.Blocks['&&methods_return'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this Blockly.Block
   */
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
  return 'return ' + Blockly.JavaScript.valueToCode('VALUE') + ';';
};

const methodsCallback = workspace => {
  let xmlList = [];
  if (Blockly.Blocks['&&methods_def']) {
    // <block type="procedures_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    let block = document.createElement('block');
    block.setAttribute('type', '&&methods_def');
    block.setAttribute('gap', 16);
    let nameField = document.createElement('field');
    nameField.setAttribute('NAME', '');
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['&&methods_return']) {
    // <block type="procedures_ifreturn" gap="16"></block>
    var block = document.createElement('block');
    block.setAttribute('type', '&&methods_return');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  function populateProcedures(procedureList, templateName) {
    for (var i = 0; i < procedureList.length; i++) {
      let type = procedureList[i][0];
      let name = procedureList[i][1];
      let args = procedureList[i][3];
      // <block type="procedures_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      let block = document.createElement('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      let mutation = document.createElement('mutation');
      mutation.setAttribute('name', name);
      mutation.setAttribute('type', type);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }
  let tuple = Blockly.Procedures.allProcedures(workspace);
  populateProcedures(tuple[0], '&&methods_call');
  return xmlList;
};
