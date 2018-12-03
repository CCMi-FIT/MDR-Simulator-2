//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal,  Button } from 'react-bootstrap';
import * as panels from '../../panels';

type Props = {
  nodeData: any,
  next: (string) => void
}

type State = {
  selection: "situation" | "event",
};

class NewNodeForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = { 
      selection: "situation",
    };
  }

  selectionMade = (event) => {
    let val = event.currentTarget.value;
    this.setState({ selection: val });
  };

  setNodeType = () => {
    panels.hideModal();
    this.props.next(this.state.selection);
  }

  render() {
    return ( 
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Select new node type:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group"> 
            <select className="form-control" value={this.state.selection} onChange={(ev) => this.selectionMade(ev)}>
              <option key="situation" value="situation">Situation</option>
              <option key="event" value="event">Event</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-primary" onClick={this.setNodeType}>Select type</Button>
        </Modal.Footer>
      </Modal.Dialog>);
  }
}

export function render(nodeData: any, next: (string) => void) {
  let panel = panels.getModal();
  if (panel) {
    ReactDOM.render(<NewNodeForm nodeData={nodeData} next={next}/>, panel);
    panels.showModal();
  }
}

