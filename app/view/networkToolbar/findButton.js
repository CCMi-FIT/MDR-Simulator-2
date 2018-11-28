//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

type Props = {
  network: any,
  elements: Array<any>,
  labelKey: string
};

export class FindElement extends React.Component<Props> {
  
  find = (element: any) => {
    if (element) {
      this.props.network.fit({ 
        nodes: [element.e_id],
        animation: true
      });
    }
  }

  render() {
    return ( 
      <div className="btn-group" role="group">
        <div style={{float: "left"}}>
          <Typeahead
            options={this.props.elements}
            labelKey={this.props.labelKey}
            onChange={entities => { 
              if (entities.length) { 
                this.find(entities[0]);
              }
            }}
          />
        </div>
        <div style={{float: "left"}}>
          <i className="btn btn-default glyphicon glyphicon-search disabled"></i>
        </div>
      </div>);
  }
}

