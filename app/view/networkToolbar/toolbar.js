//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import type { UfoaModel } from '../../metamodel/ufoa';
import * as ufoaDB from '../../db/ufoa';
import * as panels from '../panels';
import { FindElement } from './findButton';
import { SaveLayout } from './saveLayoutButton';

type Props = {
  ufoaModel: UfoaModel,
  network: any
};

class UfoaNetworkToolbar extends React.Component<Props> {

  render() {
    return ( 
      <div className="btn-toolbar" role="toolbar">
        <FindElement network={this.props.network} elements={ufoaDB.getEntities()} labelKey="e_name" />
        <div className="btn-group" role="group">
          <SaveLayout network={this.props.network} db={ufoaDB}/>
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

