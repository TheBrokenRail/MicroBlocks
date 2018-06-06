import util from './util';
import Blockly from '../blockly';

util.blockGenerators_.push(() => {
  Blockly.Blocks['&&basic_string'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput(''), 'STR');
      this.setInputsInline(true);
      this.setOutput(true, 'char*');
      this.setColour(160);
      this.quoteField_('STR');
    },
    QUOTE_IMAGE_LEFT_DATAURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
      'n0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY' +
      '1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1' +
      'HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMf' +
      'z9AylsaRRgGzvZAAAAAElFTkSuQmCC',
    QUOTE_IMAGE_RIGHT_DATAURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
      'qUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhg' +
      'gONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvB' +
      'O3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5Aos' +
      'lLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==',
    QUOTE_IMAGE_WIDTH: 12,
    QUOTE_IMAGE_HEIGHT: 12,
    quoteField_: function (fieldName) {
      for (let i = 0, input; input = this.inputList[i]; i++) {
        for (let j = 0, field; field = input.fieldRow[j]; j++) {
          if (fieldName == field.name) {
            input.insertFieldAt(j, this.newQuote_(true));
            input.insertFieldAt(j + 2, this.newQuote_(false));
            return;
          }
        }
      }
      console.warn('field named "' + fieldName + '" not found in ' + this.toDevString());
    },
    newQuote_: function (open) {
      let isLeft = this.RTL ? !open : open;
      let dataUri = isLeft ?
        this.QUOTE_IMAGE_LEFT_DATAURI :
        this.QUOTE_IMAGE_RIGHT_DATAURI;
      return new Blockly.FieldImage(
          dataUri,
          this.QUOTE_IMAGE_WIDTH,
          this.QUOTE_IMAGE_HEIGHT,
          isLeft ? '\u201C' : '\u201D');
    }
  };
  Blockly.JavaScript['&&basic_string'] = function (block) {
    return ['"' + block.getFieldValue('STR') + '"'];
  };
  Blockly.Blocks['&&basic_char'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('\'')
          .appendField(new Blockly.FieldTextInput('', str => str.length > 0 ? str.charAt(0) : ''), 'STR')
          .appendField('\'');
      this.setInputsInline(true);
      this.setOutput(true, 'char');
      this.setColour(160);
    }
  };
  Blockly.JavaScript['&&basic_char'] = function (block) {
    return ['\'' + block.getFieldValue('STR') + '\''];
  };
  Blockly.Blocks['&&basic_number'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldNumber(''), 'NUM')
      this.setInputsInline(true);
      this.setOutput(['int', 'float', 'double', 'long']);
      this.setColour(160);
    }
  };
  Blockly.JavaScript['&&basic_number'] = function (block) {
    return block.getFieldValue('NUM');
  };
  Blockly.Blocks['&&basic_if'] = {
    init: function () {
      this.appendValueInput('IF0')
          .appendField('if');
      this.appendStatementInput('DO0');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
      this.setMutator(new Blockly.Mutator(['&&basic_if_elseif', '&&basic_if_else']));
    },
    elseifCount_: 0,
    elseCount_: 0,
    mutationToDom: function () {
      if (!this.elseifCount_ && !this.elseCount_) {
        return null;
      }
      let container = document.createElement('mutation');
      if (this.elseifCount_) {
        container.setAttribute('elseif', this.elseifCount_);
      }
      if (this.elseCount_) {
        container.setAttribute('else', 1);
      }
      return container;
    },
    domToMutation: function (xmlElement) {
      this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
      this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
      this.updateShape_();
    },
    decompose: function (workspace) {
      let containerBlock = workspace.newBlock('&&basic_if_if');
      containerBlock.initSvg();
      let connection = containerBlock.nextConnection;
      for (let i = 1; i <= this.elseifCount_; i++) {
        let elseifBlock = workspace.newBlock('&&basic_if_elseif');
        elseifBlock.initSvg();
        connection.connect(elseifBlock.previousConnection);
        connection = elseifBlock.nextConnection;
      }
      if (this.elseCount_) {
        let elseBlock = workspace.newBlock('&&basic_if_else');
        elseBlock.initSvg();
        connection.connect(elseBlock.previousConnection);
      }
      return containerBlock;
    },
    compose: function (containerBlock) {
      let clauseBlock = containerBlock.nextConnection.targetBlock();
      this.elseifCount_ = 0;
      this.elseCount_ = 0;
      let valueConnections = [null];
      let statementConnections = [null];
      let elseStatementConnection = null;
      while (clauseBlock) {
        switch (clauseBlock.type) {
          case '&&basic_if_elseif': {
            this.elseifCount_++;
            valueConnections.push(clauseBlock.valueConnection_);
            statementConnections.push(clauseBlock.statementConnection_);
            break;
          }
          case '&&basic_if_else': {
            this.elseCount_++;
            elseStatementConnection = clauseBlock.statementConnection_;
            break;
          }
          default: {
            throw 'Unknown block type.';
          }
        }
        clauseBlock = clauseBlock.nextConnection &&
            clauseBlock.nextConnection.targetBlock();
      }
      this.updateShape_();
      for (let i = 1; i <= this.elseifCount_; i++) {
        Blockly.Mutator.reconnect(valueConnections[i], this, 'IF' + i);
        Blockly.Mutator.reconnect(statementConnections[i], this, 'DO' + i);
      }
      Blockly.Mutator.reconnect(elseStatementConnection, this, 'ELSE');
    },
    saveConnections: function (containerBlock) {
      let clauseBlock = containerBlock.nextConnection.targetBlock();
      let i = 1;
      while (clauseBlock) {
        switch (clauseBlock.type) {
          case '&&basic_if_elseif': {
            let inputIf = this.getInput('IF' + i);
            let inputDo = this.getInput('DO' + i);
            clauseBlock.valueConnection_ =
                inputIf && inputIf.connection.targetConnection;
            clauseBlock.statementConnection_ =
                inputDo && inputDo.connection.targetConnection;
            i++;
            break;
          }
          case '&&basic_if_else': {
            let inputDo = this.getInput('ELSE');
            clauseBlock.statementConnection_ =
                inputDo && inputDo.connection.targetConnection;
            break;
          }
          default: {
            throw 'Unknown block type.';
          }
        }
        clauseBlock = clauseBlock.nextConnection &&
            clauseBlock.nextConnection.targetBlock();
      }
    },
    updateShape_: function () {
      if (this.getInput('ELSE')) {
        this.removeInput('ELSE');
      }
      let i = 1;
      while (this.getInput('IF' + i)) {
        this.removeInput('IF' + i);
        this.removeInput('DO' + i);
        i++;
      }
      for (let i = 1; i <= this.elseifCount_; i++) {
        this.appendValueInput('IF' + i)
            .appendField('else if');
        this.appendStatementInput('DO' + i);
      }
      if (this.elseCount_) {
        this.appendStatementInput('ELSE')
            .appendField('else');
      }
    }
  };
  Blockly.JavaScript['&&basic_if'] = function(block) {
    let n = 0;
    let code = '', branchCode, conditionCode;
    do {
      conditionCode = Blockly.JavaScript.valueToCode(block, 'IF' + n,
        Blockly.JavaScript.ORDER_NONE) || 'false';
      branchCode = Blockly.JavaScript.statementToCode(block, 'DO' + n);
      code += (n > 0 ? ' else ' : '') +
          'if (' + conditionCode + ') {\n' + branchCode + '}';
      ++n;
    } while (block.getInput('IF' + n));
    if (block.getInput('ELSE')) {
      branchCode = Blockly.JavaScript.statementToCode(block, 'ELSE');
      code += ' else {\n' + branchCode + '}';
    }
    return code + '\n';
  };
  Blockly.Blocks['&&basic_if_if'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('if');
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setColour(160);
    }
  };
  Blockly.Blocks['&&basic_if_elseif'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('else if');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
    }
  };
  Blockly.Blocks['&&basic_if_else'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('else');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setColour(160);
    }
  };
  Blockly.Blocks['&&basic_operator'] = {
    init: function () {
      this.appendValueInput('IN1')
      this.appendValueInput('IN2')
          .appendField(new Blockly.FieldDropdown([['+', '+'], ['-', '-'], ['*', '*'], ['/', '/'], ['<<', '<<'], ['>>', '>>']]), 'OPERATOR');
      this.setInputsInline(true);
      this.setOutput(true);
      this.setColour(160);
    },
    onchange: function () {
      let operator = this.getInputTargetBlock('IN1') ? util.operators[this.getFieldValue('OPERATOR')][this.getInputTargetBlock('IN1').outputConnection.check_[0]] : {output: 'MISSING_TYPE', check: 'MISSING_TYPE'};
      this.getInput('IN2').setCheck([operator.check].concat(util.typeCast_[operator.check]));
      this.setOutput(true, operator.output);
    }
  };
  Blockly.JavaScript['&&basic_operator'] = function (block) {
    return ['(' + Blockly.JavaScript.valueToCode(block, 'IN1') + ') ' + block.getFieldValue('OPERATOR') + ' (' + Blockly.JavaScript.valueToCode(block, 'IN2') + ')'];
  };
  Blockly.Blocks['&&basic_operator_block'] = {
    init: function () {
      this.appendValueInput('IN1')
      this.appendValueInput('IN2')
          .appendField(new Blockly.FieldDropdown([['+', '+'], ['-', '-'], ['*', '*'], ['/', '/'], ['<<', '<<'], ['>>', '>>']]), 'OPERATOR');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
    },
    onchange: function () {
      let operator = this.getInputTargetBlock('IN1') ? util.operators[this.getFieldValue('OPERATOR')][this.getInputTargetBlock('IN1').outputConnection.check_[0]] : {output: 'MISSING_TYPE', check: 'MISSING_TYPE'};
      this.getInput('IN2').setCheck([operator.check].concat(util.typeCast_[operator.check]));
    }
  };
  Blockly.JavaScript['&&basic_operator_block'] = function (block) {
    return '(' + Blockly.JavaScript.valueToCode(block, 'IN1') + ') ' + block.getFieldValue('OPERATOR') + ' (' + Blockly.JavaScript.valueToCode(block, 'IN2') + ');';
  };
  Blockly.Blocks['&&basic_cast'] = {
    init: function () {
      this.appendValueInput('OBJ')
          .appendField('cast');
      this.appendValueInput('TYPE')
          .setCheck('C++Type')
          .appendField('to');
      this.setInputsInline(true);
      this.setOutput(true);
      this.setColour(160);
    },
    onchange: function () {
      this.setOutput(true, this.getInputTargetBlock('TYPE') ? this.getInputTargetBlock('TYPE').type : 'MISSING_TYPE');
    }
  };
});
