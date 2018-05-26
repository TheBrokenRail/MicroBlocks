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
        let argType = childNode.getAttribute('letId');
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
      paramBlock.setFieldValue(this.arguments_[i].name, 'NAME');
      paramBlock.setFieldValue(this.arguments_[i].type, 'TYPE');
      // Store the old location.
      paramBlock.oldLocation = i;
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
      let argType = paramBlock.getFieldValue('TYPE');
      this.arguments_.push({name: argName, type: argType});
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
    this.appendDummyInput('STATEMENT_INPUT')
        .appendField(ScratchBlocks.Msg.PROCEDURES_ALLOW_STATEMENTS)
        .appendField(new ScratchBlocks.FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    this.setTooltip(ScratchBlocks.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

ScratchBlocks.Blocks['procedures_mutatorarg'] = {
  /**
   * Mutator block for procedure argument.
   * @this ScratchBlocks.Block
   */
  init: () => {
    let field = new ScratchBlocks.FieldTextInput('x', this.validator_);
    // Hack: override showEditor to do just a little bit more work.
    // We don't have a good place to hook into the start of a text edit.
    field.oldShowEditorFn_ = field.showEditor_;
    let newShowEditorFn = () => {
      this.createdletiables_ = [];
      this.oldShowEditorFn_();
    };
    field.showEditor_ = newShowEditorFn;

    this.appendDummyInput()
        .appendField(ScratchBlocks.Msg.PROCEDURES_MUTATORARG_TITLE)
        .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    this.setTooltip(ScratchBlocks.Msg.PROCEDURES_MUTATORARG_TOOLTIP);
    this.contextMenu = false;

    // Create the default letiable when we drag the block in from the flyout.
    // Have to do this after installing the field on the block.
    field.onFinishEditing_ = this.deleteIntermediatelets_;
    // Create an empty list so onFinishEditing_ has something to look at, even
    // though the editor was never opened.
    field.createdletiables_ = [];
    field.onFinishEditing_('x');
  },
  /**
   * Obtain a valid name for the procedure argument. Create a letiable if
   * necessary.
   * Merge runs of whitespace.  Strip leading and trailing whitespace.
   * Beyond this, all names are legal.
   * @param {string} letName User-supplied name.
   * @return {?string} Valid name, or null if a name was not specified.
   * @private
   * @this ScratchBlocks.FieldTextInput
   */
  validator_: function(letName) {
    let outerWs = ScratchBlocks.Mutator.findParentWs(this.sourceBlock_.workspace);
    letName = letName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!letName) {
      return null;
    }
    let model = outerWs.getletiable(letName, '');
    if (model && model.name != letName) {
      // Rename the letiable (case change)
      outerWs.renameletById(model.getId(), letName);
    }
    if (!model) {
      model = outerWs.createletiable(letName, '');
      if (model && this.createdletiables_) {
        this.createdletiables_.push(model);
      }
    }
    return letName;
  },
  /**
   * Called when focusing away from the text field.
   * Deletes all letiables that were created as the user typed their intended
   * letiable name.
   * @param {string} newText The new letiable name.
   * @private
   * @this ScratchBlocks.FieldTextInput
   */
  deleteIntermediatelets_: function(newText) {
    let outerWs = ScratchBlocks.Mutator.findParentWs(this.sourceBlock_.workspace);
    if (!outerWs) {
      return;
    }
    for (let i = 0; i < this.createdletiables_.length; i++) {
      let model = this.createdletiables_[i];
      if (model.name != newText) {
        outerWs.deleteletiableById(model.getId());
      }
    }
  }
};

ScratchBlocks.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendDummyInput('TOPROW')
        .appendField(this.id, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(ScratchBlocks.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
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
  renameProcedure: function(oldName, newName) {
    if (ScratchBlocks.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      let baseMsg = this.outputConnection ?
          ScratchBlocks.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
          ScratchBlocks.Msg.PROCEDURES_CALLNORETURN_TOOLTIP;
      this.setTooltip(baseMsg.replace('%1', newName));
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
  setProcedureParameters_: function(paramNames, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: ScratchBlocks.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    let defBlock = ScratchBlocks.Procedures.getDefinition(this.getProcedureCall(),
        this.workspace);
    let mutatorOpen = defBlock && defBlock.mutator &&
        defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
    }
    if (goog.array.equals(this.arguments_, paramNames)) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw 'Error: paramNames and paramIds must be the same length.';
    }
    this.setCollapsed(false);
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      if (paramNames.join('\n') == this.arguments_.join('\n')) {
        // No change to the parameters, allow quarkConnections_ to be
        // populated with the existing connections.
        this.quarkIds_ = paramIds;
      } else {
        this.quarkIds_ = [];
      }
    }
    // Switch off rendering while the block is rebuilt.
    let savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (let i = 0; i < this.arguments_.length; i++) {
      let input = this.getInput('ARG' + i);
      if (input) {
        let connection = input.connection.targetConnection;
        this.quarkConnections_[this.quarkIds_[i]] = connection;
        if (mutatorOpen && connection &&
            paramIds.indexOf(this.quarkIds_[i]) == -1) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours_();
        }
      }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    // And rebuild the argument model list.
    this.argumentVarModels_ = [];
    for (let i = 0; i < this.arguments_.length; i++) {
      let letiable = ScratchBlocks.letiables.getOrCreateletiablePackage(
          this.workspace, null, this.arguments_[i], '');
      this.argumentVarModels_.push(letiable);
    }

    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (let i = 0; i < this.arguments_.length; i++) {
        let quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          let connection = this.quarkConnections_[quarkId];
          if (!ScratchBlocks.Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
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
          field.setValue(this.arguments_[i]);
        } finally {
          ScratchBlocks.Events.enable();
        }
      } else {
        // Add new input.
        field = new ScratchBlocks.FieldLabel(this.arguments_[i]);
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
    // Add 'with:' if there are parameters, remove otherwise.
    let topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(ScratchBlocks.Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
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
      parameter.setAttribute('name', this.arguments_[i]);
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
    let paramIds = [];
    for (let i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        args.push(childNode.getAttribute('name'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, paramIds);
  },
  /**
   * Return all letiables referenced by this block.
   * @return {!Array.<!ScratchBlocks.letiableModel>} List of letiable models.
   * @this ScratchBlocks.Block
   */
  getletModels: () => {
    return this.argumentVarModels_;
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!ScratchBlocks.Events.Abstract} event Change event.
   * @this ScratchBlocks.Block
   */
  onchange: function(event) {
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
        /**
         * Create matching definition block.
         * <xml>
         *   <block type="procedures_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        let xml = goog.dom.createDom('xml');
        let block = goog.dom.createDom('block');
        block.setAttribute('type', this.defType_);
        let xy = this.getRelativeToSurfaceXY();
        let x = xy.x + ScratchBlocks.SNAP_RADIUS * (this.RTL ? -1 : 1);
        let y = xy.y + ScratchBlocks.SNAP_RADIUS * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        let mutation = this.mutationToDom();
        block.appendChild(mutation);
        let field = goog.dom.createDom('field');
        field.setAttribute('name', 'NAME');
        field.appendChild(document.createTextNode(this.getProcedureCall()));
        block.appendChild(field);
        xml.appendChild(block);
        ScratchBlocks.Xml.domToWorkspace(xml, this.workspace);
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
  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this ScratchBlocks.Block
   */
  customContextMenu: function(options) {
    let option = {enabled: true};
    option.text = ScratchBlocks.Msg.PROCEDURES_HIGHLIGHT_DEF;
    let name = this.getProcedureCall();
    let workspace = this.workspace;
    option.callback = () => {
      let def = ScratchBlocks.Procedures.getDefinition(name, workspace);
      if (def) {
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
  defType_: 'procedures_defnoreturn'
};

ScratchBlocks.Blocks['procedures_callreturn'] = {
  /**
   * Block for calling a procedure with a return value.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendDummyInput('TOPROW')
        .appendField('', 'NAME');
    this.setOutput(true);
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    // Tooltip is set in domToMutation.
    this.setHelpUrl(ScratchBlocks.Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
  },
  getProcedureCall: ScratchBlocks.Blocks['procedures_callnoreturn'].getProcedureCall,
  renameProcedure: ScratchBlocks.Blocks['procedures_callnoreturn'].renameProcedure,
  setProcedureParameters_:
      ScratchBlocks.Blocks['procedures_callnoreturn'].setProcedureParameters_,
  updateShape_: ScratchBlocks.Blocks['procedures_callnoreturn'].updateShape_,
  mutationToDom: ScratchBlocks.Blocks['procedures_callnoreturn'].mutationToDom,
  domToMutation: ScratchBlocks.Blocks['procedures_callnoreturn'].domToMutation,
  getletModels: ScratchBlocks.Blocks['procedures_callnoreturn'].getletModels,
  onchange: ScratchBlocks.Blocks['procedures_callnoreturn'].onchange,
  customContextMenu:
      ScratchBlocks.Blocks['procedures_callnoreturn'].customContextMenu,
  defType_: 'procedures_defreturn'
};

ScratchBlocks.Blocks['procedures_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this ScratchBlocks.Block
   */
  init: () => {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(ScratchBlocks.Msg.CONTROLS_IF_MSG_IF);
    this.appendValueInput('VALUE')
        .appendField(ScratchBlocks.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ScratchBlocks.Msg.PROCEDURES_HUE);
    this.setTooltip(ScratchBlocks.Msg.PROCEDURES_IFRETURN_TOOLTIP);
    this.setHelpUrl(ScratchBlocks.Msg.PROCEDURES_IFRETURN_HELPURL);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {!Element} XML storage element.
   * @this ScratchBlocks.Block
   */
  mutationToDom: () => {
    let container = document.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this ScratchBlocks.Block
   */
  domToMutation: function(xmlElement) {
    let value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value == 1);
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE')
          .appendField(ScratchBlocks.Msg.PROCEDURES_DEFRETURN_RETURN);
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!ScratchBlocks.Events.Abstract} e Change event.
   * @this ScratchBlocks.Block
   */
  onchange: function(/* e */) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return;  // Don't change state at the start of a drag.
    }
    let legal = false;
    // Is the block nested in a procedure?
    let block = this;
    do {
      if (this.FUNCTION_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE')
            .appendField(ScratchBlocks.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = false;
      } else if (block.type == 'procedures_defreturn' &&
                 !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE')
            .appendField(ScratchBlocks.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setDisabled(false);
      }
    } else {
      this.setWarningText(ScratchBlocks.Msg.PROCEDURES_IFRETURN_WARNING);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  },
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * ScratchBlocks.Blocks['procedures_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['procedures_defnoreturn', 'procedures_defreturn']
};
