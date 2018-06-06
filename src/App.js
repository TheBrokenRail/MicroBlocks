import React, { Component } from 'react';
import Blockly from './blockly';
import util from './blocks/util';
import './blocks/methods';
import './blocks/variables';
import './blocks/basic';

class App extends Component{
  render() {
    return(
      <div className="App">
        <h1> Hello, World! </h1>
      </div>
    );
  }
}

export default App;
