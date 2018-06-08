import React, { Component } from 'react';
import BlocklyApp from './blockly-app';

class App extends Component {
  render() {
    return (
      <div>
        <BlocklyApp getUtil={util => this.util = util} setName={data => this.name = data} getName={() => this.name} />
      </div>
    );
  }
}

export default App;
