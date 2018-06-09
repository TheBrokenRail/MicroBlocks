import React, { Component } from 'react';
import styles from './menu-bar.css';

class MenuItem extends Component {
  render() {
    return (
      <li className={styles.item}>
        {this.props.children}
      </li>
    );
  }
}

export default MenuItem;
