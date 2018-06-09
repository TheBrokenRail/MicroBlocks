import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuItemTitle extends Component {
  render() {
    return (
      <span className={styles.itemTitle}>
        {this.props.children}
      </span>
    );
  }
}

export default MenuItemTitle;
