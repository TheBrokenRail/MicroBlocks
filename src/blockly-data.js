const blocklyToolbox = document.createElement('XML');
blocklyToolbox.innerHTML = `
  <category name="Methods" colour="210" custom="METHODS"></category>
  <category name="Variables" colour="20">
    <block type="&amp;&amp;variables_initialize"></block>
    <block type="&amp;&amp;variables_initialize_to"></block>
    <block type="&amp;&amp;variables_set"></block>
    <block type="&amp;&amp;variables_get"></block>
  </category>
  <category name="Basic" colour="160">
    <block type="&amp;&amp;basic_string"></block>
    <block type="&amp;&amp;basic_char"></block>
    <block type="&amp;&amp;basic_number"></block>
    <block type="&amp;&amp;basic_if"></block>
    <block type="&amp;&amp;basic_operator"></block>
    <block type="&amp;&amp;basic_list_operator"></block>
    <block type="&amp;&amp;basic_operator_block"></block>
    <block type="&amp;&amp;basic_cast"></block>
  </category>
`;
const blocklyWorkspace = document.createElement('XML');
blocklyWorkspace.innerHTML = `
  <block type="&amp;&amp;methods_def" x="0" y="0">
    <mutation name="main"></mutation>
    <field name="NAME">main</field>
    <value name="TYPE">
      <block type="void"></block>
    </value>
  </block>
`;

export default {toolbox: blocklyToolbox, workspace: blocklyWorkspace};
