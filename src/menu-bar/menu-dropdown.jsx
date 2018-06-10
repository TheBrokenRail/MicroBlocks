import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuDropdown extends Component {
  render() {
    return (
      <div className={styles.dropdown}>
        {this.props.children}
      </div>
    );
  }
}

export default MenuDropdown;
