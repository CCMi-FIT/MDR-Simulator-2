//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import * as panels from '../../panels';
import { UfoaNewLayout } from './newLayoutButton';
import { UfoaSaveLayout } from './saveLayoutButton';

type Props = {
  network: any
};

class UfoaNetworkToolbar extends React.Component<Props> {

  render() {
    return ( 
      <div>
        <UfoaNewLayout network={this.props.network}/>
        <UfoaSaveLayout network={this.props.network}/>
      </div>);
  }
}

export function render(network: any) {
  let container = panels.getPanel("ufoa-float-toolbar");
  if (container) {
    ReactDOM.render(<UfoaNetworkToolbar network={network}/>, container);
  }
}

