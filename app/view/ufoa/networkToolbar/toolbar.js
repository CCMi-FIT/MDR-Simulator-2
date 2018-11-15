//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import type { UfoaModel } from '../../../metamodel/ufoa';
import * as panels from '../../panels';
import { FindEntity } from './findButton';
import { UfoaNewLayout } from './newLayoutButton';
import { UfoaSaveLayout } from './saveLayoutButton';

type Props = {
  ufoaModel: UfoaModel,
  network: any
};

        //<UfoaNewLayout ufoaModel={this.props.ufoaModel} network={this.props.network}/>
        //&nbsp;
class UfoaNetworkToolbar extends React.Component<Props> {

  render() {
    return ( 
      <div className="btn-toolbar" role="toolbar">
        <FindEntity network={this.props.network}/>
        <div className="btn-group" role="group">
          <UfoaSaveLayout network={this.props.network}/>
        </div>
      </div>);
  }
}

export function render(ufoaModel: UfoaModel, network: any) {
  let container = panels.getPanel("ufoa-float-toolbar");
  if (container) {
    ReactDOM.render(<UfoaNetworkToolbar ufoaModel={ufoaModel} network={network}/>, container);
  }
}

