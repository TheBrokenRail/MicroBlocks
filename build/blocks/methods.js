let ScratchBlocks = window.ScratchBlocks;

ScratchBlocks.Blocks['methods_definition'] = {
  init: () => {
    this.jsonInit({
      message0: 'define %1',
      message1: '%1',
      args0: [
        {
          type: 'input_value',
          name: 'TYPE',
          check: 'C++Type'
        }
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      category: ScratchBlocks.Categories.motion,
      colour: ScratchBlocks.Colours.control
    });
    this.setMutator(new ScratchBlocks.Mutator(['methods_mutator']));
    this.args_ = [];
  },
  onchange: () => {
    for (let i = 0; i < args_; i++) {
      if (this.getInput('ARGS' + i)) {
        this.removeInput('ARGS' + i);
      }
      if (this.getInput('ARGS_NAME' + i)) {
        this.removeInput('ARGS_NAME' + i);
      }
    }
    for (let i = 0; i < args_; i++) {
      this.appendValueInput('ARGS' + i)
        .setCheck('C++Type');
      this.appendValueInput('ARGS_NAME' + i)
        .setCheck('String')
        .appendField(new ScratchBlocks.FieldTextInput(args[i].name));
    }
  }
};
