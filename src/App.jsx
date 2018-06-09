import React, { Component } from 'react';
import BlocklyApp from './blockly-app';
import MenuBar from './menu-bar/menu-bar';
import MenuItem from './menu-bar/menu-item';
import MenuItemTitle from './menu-bar/menu-item-title';
import MenuDropdown from './menu-bar/menu-dropdown';
import MenuDropdownItem from './menu-bar/menu-dropdown-item';
import logo from './logo.svg';
import { downloadFile } from './file-util.jsx';

class App extends Component {
  render() {
    return (
      <div>
        <MenuBar>
          <MenuItem>
            <MenuItemTitle><img src={logo} height="13"></img></MenuItemTitle>
          </MenuItem>
          <MenuItem>
            <MenuItemTitle>File</MenuItemTitle>
            <MenuDropdown>
              <MenuDropdownItem>Save</MenuDropdownItem>
            </MenuDropdown>
          </MenuItem>
        </MenuBar>
        <BlocklyApp getUtil={util => this.util = util} setName={data => this.name = data} getName={() => this.name} />
      </div>
    );
  }
}

export default App;
