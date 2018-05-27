Blockly.Blocks['&&variables_get'] = {
  init: function () {
    this.jsonInit({
      type: '&&variables_get',
      message0: 'get %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: function () {
            return [];
          }
        }
      ],
      inputsInline: true,
      output: 'MISSING_TYPE',
      colour: 20
    });
  }
};
