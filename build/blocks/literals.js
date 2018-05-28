Blockly.Blocks['&&literals_string'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput(''), 'STR')
        .appendField('"');
    this.setInputsInline(true);
    this.setOutput('char*');
    this.setColour(160);
  }
};
Blockly.JavaScript['&&literals_string'] = function (block) {
  return block.getFieldValue('STR');
};
Blockly.Blocks['&&literals_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(''), 'NUM')
    this.setInputsInline(true);
    this.setOutput(['int', 'float', 'double', 'long']);
    this.setColour(160);
  }
};
Blockly.JavaScript['&&literals_number'] = function (block) {
  return block.getFieldValue('NUM');
};
