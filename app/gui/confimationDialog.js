// @flow

import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';

type State = {
  show: boolean;
};

class Example extends React.Component<{}, State> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: false
    };
  }

  close = () => {
    this.setState({ show: false });
  }

  show = () => {
    this.setState({ show: true });
  }

  render() {
    return (
      <div>
        <Modal show={this.state.show} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Text in a modal</h4>
            <p>
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}