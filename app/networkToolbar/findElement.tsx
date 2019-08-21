import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

interface Props {
  network: any;
  elements: any[];
  labelKey: string;
  identifier: string;
}

export class FindElement extends React.Component<Props> {
  private find(element: any) {
    if (element) {
      this.props.network.fit({
        nodes: [element[this.props.identifier]],
        animation: true
      });
    }
  }

  public render() {
    return (
      <div className="input-group" role="group">
        <div style={{float: "left", width: "300px"}}>
          <Typeahead
            id="findTA"
            options={this.props.elements}
            labelKey={this.props.labelKey}
            onChange={(elements) => {
              if (elements.length) {
                this.find(elements[0]);
              }
            }}
          />
        </div>
        <div style={{float: "left", width: "38px", height: "38px", paddingTop: "10px", textAlign: "center"}}>
          <i className="fas fa-search"/>
        </div>
      </div>
    );
  }
}
