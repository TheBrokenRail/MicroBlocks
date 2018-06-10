import React, { Component } from 'react';
import BlocklyApp from './blockly-app';
import MenuBar from './menu-bar/menu-bar';
import MenuItem from './menu-bar/menu-item';
import MenuItemTitle from './menu-bar/menu-item-title';
import MenuDropdown from './menu-bar/menu-dropdown';
import MenuDropdownItem from './menu-bar/menu-dropdown-item';
import logo from './logo.svg';
import { downloadFile, uploadFile } from './file-util.jsx';
import Modal from 'react-modal';
import extensions from './extensions.json';
import styles from './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Untitled',
      aboutOpen: false,
      extensionsOpen: false
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
              <MenuDropdownItem onClick={() => downloadFile(this.util.generate(this.util.workspace), this.util.getName() + '.cpp')}>
                Export
              </MenuDropdownItem>
              <MenuDropdownItem onClick={() => this.setState({extensionsOpen: true})}>
                Add Extension
              </MenuDropdownItem>
            </MenuDropdown>
          </MenuItem>
          <MenuItem>
            <MenuItemTitle onClick={() => this.setState({aboutOpen: true})}>
              About
            </MenuItemTitle>
          </MenuItem>
        </MenuBar>
        <BlocklyApp
          getUtil={util => this.util = util}
          setName={data => this.setState({name: data})}
          getName={() => this.state.name}
        />
        <Modal isOpen={this.state.aboutOpen} style={
          {
            overlay: {
              zIndex: 999
            },
            content: {
              fontFamily: 'sans-serif'
            }
          }
        }>
          <span style={
            {
              position: 'absolute',
              top: 32,
              right: 32,
              fontSize: 32,
              userSelect: 'none'
            }
          } onClick={() => this.setState({aboutOpen: false})}>X</span>
          <img src={logo} style={
            {
              width: '50%'
            }
          }></img>
          <p id="textBold">View The Source Code At:</p>
          <p id="text"><a href="https://github.com/TheBrokenRail/MicroBlocks">https://github.com/TheBrokenRail/MicroBlockss</a></p>
          <p id="textBold">Blockly-Based Frontend At:</p>
          <p id="text"><a href="https://github.com/LLK/scratch-blocks">https://github.com/LLK/scratch-blocks</a></p>
          <p id="textBold">NPM Modules Used:</p>
          <ul id="text">
              <li>blockly</li>
              <li>fast-xml-parser</li>
              <li>webpack</li>
              <li>react</li>
              <li>react-modal</li>
              <li>ncp</li>
              <li>express</li>
          </ul>
        </Modal>
        <Modal isOpen={this.state.extensionsOpen} style={
          {
            overlay: {
              zIndex: 999
            },
            content: {
              fontFamily: 'sans-serif'
            }
          }
        }>
          <span style={
            {
              position: 'absolute',
              top: 32,
              right: 32,
              fontSize: 32,
              userSelect: 'none'
            }
          } onClick={() => this.setState({extensionsOpen: false})}>X</span>
          {this.util ? extensions.map((extension, index) => (
            this.util.getExtensionList().indexOf(extension.name) ===-1 ? (<div key={index} className={styles.extension} onClick={() => {
              this.util.addExtension(extension.name);
              this.setState({extensionsOpen: false});
            }}>
              <b><p>{extension.displayName}</p></b>
              <p>{extension.description}</p>
            </div>) : null
          )) : null}
        </Modal>
      </div>
    );
  }
  componentDidMount() {
    Modal.setAppElement('#app');
  }
}

export default App;
