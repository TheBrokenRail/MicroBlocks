import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuItemTitle extends Component {
  render() {
    return (
      <span className={styles.itemTitle} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    );
  }
}

export default MenuItemTitle;
