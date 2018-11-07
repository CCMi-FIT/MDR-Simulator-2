//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import * as panels from '../panels';

type Props = {
  network: any
};

class UfoaSaveLayout extends React.Component<Props> {

  save = () => {
    var nodes = this.props.network.getPositions();
    console.log(nodes);
    // TODO: poslat na server a tam ulozit
  };

  render() {
    return ( 
      <Button onClick={this.save}>Save diagram layout</Button>);
  }
}

export function render(network: any) {
  let container = panels.getPanel("ufoa-save-layout");
  if (container) {
    $(container).css("left", `${panels.getWindowWidth() - 150}px`);
    ReactDOM.render(<UfoaSaveLayout network={network}/>, container);
  }
}

