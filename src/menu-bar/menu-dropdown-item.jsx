import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuDropdownItem extends Component {
  render() {
    return (
      <span className={styles.dropdownItem}>
        {this.props.children}
      </span>
    );
  }
}

export default MenuDropdownItem;
