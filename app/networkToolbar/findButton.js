//@flow

import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

type Props = {
  network: any,
  elements: Array<any>,
  labelKey: string,
  identifier: string
};

export class FindElement extends React.Component<Props> {
  
  find = (element: any) => {
    if (element) {
      this.props.network.fit({ 
        nodes: [element[this.props.identifier]],
        animation: true
      });
    }
  }

  render() {
    return ( 
      <div className="btn-group" role="group">
        <div style={{float: "left", width: "300px"}}>
          <Typeahead
            id="findTA"
            options={this.props.elements}
            labelKey={this.props.labelKey}
            onChange={elements => { 
              if (elements.length) { 
                this.find(elements[0]);
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

