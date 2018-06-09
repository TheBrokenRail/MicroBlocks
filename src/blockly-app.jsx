import React, { Component } from 'react';
import Blockly from './blockly';
import BlocklyData from './blockly-data';
import util from './blocks/util';
import './blocks/methods';
import './blocks/variables';
import './blocks/basic';

class BlocklyApp extends Component {
  render() {
    return (
      <div ref={blocks => this.blocks = blocks} style={{
        height: 'calc(100% - 50px)',
        width: '100%'
      }}></div>
    );
  }
  componentDidMount() {
    let workspace = Blockly.inject(this.blocks, {
      media: '/editor/media/',
      toolbox: BlocklyData.toolbox,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.75
      },
      colours: {
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
      }
    });
    util.workspace = workspace;
    let extensionsList = ['primitives'];
    util.setData_({
      setName: this.props.setName,
      getName: this.props.getName,
      setExtensionList: data => {
        extensionsList = data;
      },
      getExtensionList: () => {
        return extensionsList;
      },
      addExtension: (data, callback) => {
        extensionsList.push(data);
        util.loadExtensions(extensionsList, () => {
          callback();
        });
      }
    });
    util.loadExtensions(extensionsList, () => {
      workspace.registerToolboxCategoryCallback('METHODS', util.methodsCallback);
      Blockly.Xml.domToWorkspace(BlocklyData.workspace, workspace);
      workspace.scrollCenter();
      this.props.getUtil(util);
    });
  }
}

export default BlocklyApp;
