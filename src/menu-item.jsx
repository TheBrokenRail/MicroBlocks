import React, { Component } from 'react';

class MenuItem extends Component {
  render() {
    return (
      <li style={
        {
          float: 'left',
          display: 'block',
          color: 'white',
          textAlign: 'center',
          padding: '14px 16px',
          textDecoration: 'none'
        }
      }>
        {this.props.children}
      </li>
    );
  }
}

export default MenuItem;
