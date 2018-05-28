Blockly.Blocks['&&variables_get'] = {
  init: function () {
    let input = this.appendDummyInput()
        .appendField('get');
    this.variables = [];
    input.appendField(new Blockly.FieldDropdown(() => {
      this.variables = [];
      let recurse = block => {
        let parent = block.getParent();
          if (parent) {
          if (parent.getVar) {
            this.variables.concat(parent.getVar());
          }
          recurse(parent.getParent());
        }
      };
      recurse(this);
      let options = [];
      for (let i = 0; i < this.variables.length; i++) {
        options.push([this.variables[i].name, this.variables[i].name]);
      }
      if (options.length < 1) {
        return [['', '']];
      }
      return options;
    }, newVar => {
      if (newVar === '') {
        this.setOutput('MISSING_TYPE');
        return;
      }
      for (let i = 0; i < this.variables.length; i++) {
        if (this.variables[i].name === newVar) {
          this.setOutput(this.variables[i].name);
        }
      }
    }), 'VARIABLE');
    this.setInputsInline(true);
    this.setOutput('MISSING_TYPE');
    this.setColour(20);
  }
};
Blockly.Blocks['&&variables_set'] = {
  init: function () {
    let input = this.appendDummyInput()
        .appendField('set');
    this.appendValueInput('VALUE')
        .appendField('to');
    this.variables = [];
    input.appendField(new Blockly.FieldDropdown(() => {
      this.variables = [];
      let recurse = block => {
        let parent = block.getParent();
        if (parent) {
          if (parent.getVar) {
            this.variables.concat(parent.getVar());
          }
          recurse(parent.getParent());
        }
      };
      recurse(this);
      let options = [];
      for (let i = 0; i < this.variables.length; i++) {
        options.push([this.variables[i].name, this.variables[i].name]);
      }
      if (options.length < 1) {
        return [['', '']];
      }
      return options;
    }, newVar => {
      if (newVar === '') {
        this.setOutput('MISSING_TYPE');
        return;
      }
      for (let i = 0; i < this.variables.length; i++) {
        if (this.variables[i].name === newVar) {
          this.getInput('VALUE').setCheck(this.variables[i].type);
        }
      }
    }), 'VARIABLE');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
  }
};
Blockly.Blocks['&&variables_initialize'] = {
  init: function () {
    this.appendValueInput('TYPE')
        .setCheck('C++Type')
        .appendField('initialize');
    this.appendValueInput('VALUE')
        .appendField(new Blockly.FieldTextInput(''), 'NAME')
        .appendField('to');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
  },
  onchange: function () {
    this.getInput('VALUE').setCheck(this.getInputTargetBlock('TYPE') ? this.getInputTargetBlock('TYPE').type: 'MISSING_TYPE');
  },
  getVar: function () {
    return [{name: this.getFieldValue('NAME'), type: this.getInputTargetBlock('TYPE')}];
  }
};
