//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal } from '../../../components';
import * as panels from '../../../panels';

type Props = {
  edgeData: any,
  next: (string) => void
}

type State = {
  selection: "generalisation" | "association",
};

class NewEdgeForm extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = { 
      selection: "generalisation",
    };
  }

  selectionMade = (event) => {
    let val = event.currentTarget.value;
    this.setState({ selection: val });
  };

  setEdgeType = () => {
    panels.disposeModal();
    this.props.next(this.state.selection);
  }

  render() {
    return ( 
      <Modal heading="Select new edge type:">
        <div className="form-group"> 
          <select className="form-control" value={this.state.selection} onChange={(ev) => this.selectionMade(ev)}>
            <option key="generalisation" value="generalisation">Generalisation</option>
            <option key="association" value="association">Association</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={this.setEdgeType}>Select type</button>
      </Modal>
    );
  }
}

export function render(edgeData: any, next: (string) => void) {
  let panel = panels.getModal();
  if (panel) {
    ReactDOM.render(<NewEdgeForm edgeData={edgeData} next={next}/>, panel);
    panels.showModal();
  }
}

