let ScratchBlocks = window.ScratchBlocks;

ScratchBlocks.Blocks['methods_def'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this ScratchBlocks.Block
   */
  init: () => {
    let nameField = new ScratchBlocks.FieldTextInput('',
        ScratchBlocks.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendValueInput('TYPE');
    this.appendDummyInput()
        .appendField(ScratchBlocks.Msg.PROCEDURES_DEFNORETURN_TITLE)
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.setMutator(new ScratchBlocks.Mutator(['methods_mutatorarg']));
    this.setColour(ScratchBlocks.Colours.control);
    this.arguments_ = [];
    this.appendStatementInput('STACK')
        .appendField(ScratchBlocks.Msg.PROCEDURES_DEFNORETURN_DO);
    this.statementConnection_ = null;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this ScratchBlocks.Block
   */
  updateParams_: () => {
    // Check for duplicated arguments.
    let badArg = false;
    let hash = {};
    for (let i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].name] || this.arguments_[i].name.contains(' ')) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].name] = true;
    }
    if (badArg) {
      this.setWarningText(ScratchBlocks.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
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
      paramString = ScratchBlocks.Msg.PROCEDURES_BEFORE_PARAMS +
          ' ' + param.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    ScratchBlocks.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      ScratchBlocks.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by ScratchBlocks.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this ScratchBlocks.Block
   */
  mutationToDom: function(opt_paramIds) {
    let container = document.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
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
   * @this ScratchBlocks.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (let i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        let argName = childNode.getAttribute('name');
        let argType = childNode.getAttribute('type');
        this.arguments_.push({name: argName, type: argType});
      }
    }
    this.updateParams_();
    ScratchBlocks.Procedures.mutateCallers(this);
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!ScratchBlocks.Workspace} workspace Mutator's workspace.
   * @return {!ScratchBlocks.Block} Root block in mutator.
   * @this ScratchBlocks.Block
   */
  decompose: function(workspace) {
    let containerBlock = workspace.newBlock('methods_mutatorcontainer');
    containerBlock.initSvg();

    // Parameter list.
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.arguments_.length; i++) {
      let paramBlock = workspace.newBlock('methods_mutatorarg');
      paramBlock.initSvg();
      let typeBlock = workspace.newBlock(this.arguments_[i].type);
      typeBlock.initSvg();
      paramBlock.getInput('type').connect(typeBlock.outputConnection);
      paramBlock.setFieldValue(this.arguments_[i].name, 'NAME');
      // Store the old location.
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    ScratchBlocks.Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!ScratchBlocks.Block} containerBlock Root block in mutator.
   * @this ScratchBlocks.Block
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      let argName = paramBlock.getFieldValue('NAME');
      let argType = paramBlock.getInputTargetBlock('TYPE');
      this.arguments_.push({name: argName, type: argType.type});
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    ScratchBlocks.Procedures.mutateCallers(this);
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   * @this ScratchBlocks.Block
   */
  getProcedureDef: () => {
    return [this.getFieldValue('TYPE'), this.getFieldValue('NAME'), this.arguments_];
  },
  /**
   * Return all letiables referenced by this block.
   * @return {!Array.<string>} List of letiable names.
   * @this ScratchBlocks.Block
   */
  getArgs: () => {
    return this.arguments_;
  },
  callType_: 'methods_call'
};

ScratchBlocks.Blocks['methods_mutatorcontainer'] = {
  /**
   * Mutator block for procedure container.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendDummyInput()
        .appendField(ScratchBlocks.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
    this.appendStatementInput('STACK');
    this.setColour(ScratchBlocks.Colours.control);
    this.contextMenu = false;
  }
};

ScratchBlocks.Blocks['methods_mutatorarg'] = {
  /**
   * Mutator block for procedure argument.
   * @this ScratchBlocks.Block
   */
  init: () => {
    let field = new ScratchBlocks.FieldTextInput('x', this.validator_);
    this.appendValueInput('TYPE');
    this.appendDummyInput()
        .appendField(ScratchBlocks.Msg.PROCEDURES_MUTATORARG_TITLE)
        .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    this.contextMenu = false;
  }
};

ScratchBlocks.Blocks['methods_call'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendDummyInput('TOPROW')
        .appendField(this.id, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Colours.control);
    this.arguments_ = [];
  },
  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this ScratchBlocks.Block
   */
  getProcedureCall: () => {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this ScratchBlocks.Block
   */
  renameProcedure: (oldName, newName) => {
    if (ScratchBlocks.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      let baseMsg = this.outputConnection ?
          ScratchBlocks.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
          ScratchBlocks.Msg.PROCEDURES_CALLNORETURN_TOOLTIP;
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this ScratchBlocks.Block
   */
  setProcedureParameters_: (args) => {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: ScratchBlocks.Connection}
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
    this.arguments_ = [].concat(args);
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.arguments_.length; i++) {
      if (quark[i]) {
        let connection = quark[i];
        if (!ScratchBlocks.Mutator.reconnect(connection, this, 'ARG' + i)) {
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
   * @this ScratchBlocks.Block
   */
  updateShape_: () => {
    for (let i = 0; i < this.arguments_.length; i++) {
      let field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        ScratchBlocks.Events.disable();
        try {
          field.setValue(this.arguments_[i].name + ':');
        } finally {
          ScratchBlocks.Events.enable();
        }
      } else {
        // Add new input.
        field = new ScratchBlocks.FieldLabel(this.arguments_[i].name);
        let input = this.appendValueInput('ARG' + i)
            .setAlign(ScratchBlocks.ALIGN_RIGHT)
            .appendField(field, 'ARGNAME' + i);
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
   * @this ScratchBlocks.Block
   */
  mutationToDom: () => {
    let container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (let i = 0; i < this.arguments_.length; i++) {
      let parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i].name);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this ScratchBlocks.Block
   */
  domToMutation: function(xmlElement) {
    let name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    let args = [];
    for (let i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        args.push(childNode.getAttribute('name'));
      }
    }
    this.setProcedureParameters_(args);
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!ScratchBlocks.Events.Abstract} event Change event.
   * @this ScratchBlocks.Block
   */
  onchange: (event) => {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (event.type == ScratchBlocks.Events.BLOCK_CREATE &&
        event.ids.indexOf(this.id) != -1) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      let name = this.getProcedureCall();
      let def = ScratchBlocks.Procedures.getDefinition(name, this.workspace);
      if (def && (def.type != this.defType_ ||
          JSON.stringify(def.arguments_) != JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        ScratchBlocks.Events.setGroup(event.group);
        this.dispose(true, false);
        ScratchBlocks.Events.setGroup(false);
      }
    } else if (event.type == ScratchBlocks.Events.BLOCK_DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      let name = this.getProcedureCall();
      let def = ScratchBlocks.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        ScratchBlocks.Events.setGroup(event.group);
        this.dispose(true, false);
        ScratchBlocks.Events.setGroup(false);
      }
    }
  },
  defType_: 'methods_def'
};

ScratchBlocks.Blocks['methods_return'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendValueInput('VALUE')
        .appendField(ScratchBlocks.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Colours.control);
    this.hasReturnValue_ = true;
  }
};

const methodsCallback = workspace => {
  let xmlList = [];
  if (ScratchBlocks.Blocks['methods_def']) {
    // <block type="procedures_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    let block = document.createElement('block');
    block.setAttribute('type', 'methods_def');
    block.setAttribute('gap', 16);
    let nameField = document.createElement('field');
    nameField.setAttribute('', 'NAME');
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (ScratchBlocks.Blocks['methods_return']) {
    // <block type="procedures_ifreturn" gap="16"></block>
    var block = document.createElement('block');
    block.setAttribute('type', 'methods_ifreturn');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  function populateProcedures(procedureList, templateName) {
    for (var i = 0; i < procedureList.length; i++) {
      let name = procedureList[i][0];
      let args = procedureList[i][1];
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
      block.appendChild(mutation);
      for (let j = 0; j < args.length; j++) {
        let arg = document.createElement('arg');
        arg.setAttribute('name', args[j]);
        mutation.appendChild(arg);
      }
      xmlList.push(block);
    }
  }

  let tuple = ScratchBlocks.Procedures.allProcedures(workspace);
  populateProcedures(tuple[0], 'methods_call');
  return xmlList;
};
