let ScratchBlocks = window.ScratchBlocks;

ScratchBlocks.Blocks['methods_definition'] = {
  init: function() {
    this.jsonInit({
      message0: 'define %1 ()',
      args0: [
        {
          type: 'input_value',
          name: 'TYPE',
          check: 'C++Type'
        },
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      category: ScratchBlocks.Categories.motion,
      colour: ScratchBlocks.Colours.control
    });
  }
};
