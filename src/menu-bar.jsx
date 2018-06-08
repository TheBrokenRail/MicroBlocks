import React, { Component } from 'react';

class MenuBar extends Component {
  render() {
    return (
      <ul style={
        {
          list-style-type: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          background-color: '#333'
        }
      }>
        {this.props.children}
      </ul>
    );
  }
}

export default MenuBar;
