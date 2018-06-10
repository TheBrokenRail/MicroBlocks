import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuDropdownItem extends Component {
  render() {
    return (
      <span className={styles.dropdownItem} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    );
  }
}

export default MenuDropdownItem;
