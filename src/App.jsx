import React, { Component } from 'react';
import BlocklyApp from './blockly-app';
import MenuBar from './menu-bar';
import MenuItem from './menu-item';
import logo from './logo.svg';

class App extends Component {
  render() {
    return (
      <div>
        <MenuBar>
          <MenuItem>
            <img src={logo}></img>
          </MenuItem>
        </MenuBar>
        <BlocklyApp getUtil={util => this.util = util} setName={data => this.name = data} getName={() => this.name} />
      </div>
    );
  }
}

export default App;
