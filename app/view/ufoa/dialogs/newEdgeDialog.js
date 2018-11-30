//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal,  Button } from 'react-bootstrap';
import * as panels from '../../panels';

type Props = {
  edgeData: any,
  next: (string) => void
}

type State = {
  selection: "generalisation" | "association",
};

class NewEdgeForm extends React.Component<Props, State> {

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
    panels.hideModal();
    this.props.next(this.state.selection);
  }

  render() {
    return ( 
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Select new edge type:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group"> 
            <select className="form-control" value={this.state.selection} onChange={(ev) => this.selectionMade(ev)}>
              <option key="generalisation" value="generalisation">Generalisation</option>
              <option key="association" value="association">Association</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-primary" onClick={this.setEdgeType}>Select type</Button>
        </Modal.Footer>
      </Modal.Dialog>);
  }
}

export function render(edgeData: any, next: (string) => void) {
  let panel = panels.getModal();
  if (panel) {
    ReactDOM.render(<NewEdgeForm edgeData={edgeData} next={next}/>, panel);
    panels.showModal();
  }
}

