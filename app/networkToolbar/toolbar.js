//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as panels from '../panels';
import { FindElement } from './findElement';
import { SaveLayout } from './saveLayoutButton';

type Props = {
  elements: Array<any>,
  labelKey: string,
  identifier: string,
  db: any,
  network: any
};

class NetworkToolbar extends React.Component<Props> {

  render() {
    return ( 
      <div className="btn-toolbar" role="toolbar">
        <FindElement network={this.props.network} elements={this.props.elements} labelKey={this.props.labelKey} identifier={this.props.identifier}/>
        <div className="btn-group" role="group">
          <SaveLayout network={this.props.network} db={this.props.db}/>
        </div>
      </div>);
  }
}

export function render(panel: string, elements: Array<any>, labelKey: string, identifier: string, db: any, network: any) {
  let container = panels.getPanel(panel);
  if (container) {
    ReactDOM.render(<NetworkToolbar elements={elements} labelKey={labelKey} identifier={identifier} db={db} network={network}/>, container);
  }
}

