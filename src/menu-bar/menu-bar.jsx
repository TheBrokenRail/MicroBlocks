import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuBar extends Component {
  render() {
    return (
      <ul className={styles.bar}>
        {this.props.children}
      </ul>
    );
  }
}

export default MenuBar;
