import React, { Component } from 'react';
import BlocklyApp from './blockly-app';
import MenuBar from './menu-bar/menu-bar';
import MenuItem from './menu-bar/menu-item';
import MenuItemTitle from './menu-bar/menu-item-title';
import MenuDropdown from './menu-bar/menu-dropdown';
import MenuDropdownItem from './menu-bar/menu-dropdown-item';
import logo from './logo.svg';
import { downloadFile, uploadFile } from './file-util.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Untitled'
    };
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MenuBar>
          <MenuItem>
            <MenuItemTitle>
              <img src={logo} height="21"></img>
            </MenuItemTitle>
          </MenuItem>
          <MenuItem>
            <MenuItemTitle>
              <input
                style={
                  {
                    fontSize: 16,
                    border: 'none'
                  }
                }
                value={this.state.name}
                onChange={evt => this.setState({name: evt.target.value})}
              />
            </MenuItemTitle>
          </MenuItem>
          <MenuItem>
            <MenuItemTitle>
              File
            </MenuItemTitle>
            <MenuDropdown>
              <MenuDropdownItem onClick={() => uploadFile(data => this.util.load(data))}>
                Load
              </MenuDropdownItem>
              <MenuDropdownItem onClick={() => downloadFile(this.util.save(), this.util.getName() + '.json')}>
                Save
              </MenuDropdownItem>
            </MenuDropdown>
          </MenuItem>
        </MenuBar>
        <BlocklyApp
          getUtil={util => this.util = util}
          setName={data => this.setState({name: data})}
          getName={() => this.state.name}
        />
      </div>
    );
  }
}

export default App;
