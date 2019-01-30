//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import { Editor } from '@tinymce/tinymce-react';
import * as panels from '../../../panels';

type Props = {
  title: string,
  wmdaText: string,
  resolve: any,
  reject: () => void
}

type State = {
  wmdaText2: string
};

class WMDAForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = { 
      wmdaText2: props.wmdaText
    };
  }

  setText = (val: string) => {
    this.setState({ wmdaText2: val });
  }

  save = () => {
    panels.disposeModal();
    this.props.resolve(this.state.wmdaText2);
  }

  cancel = () => {
    panels.disposeModal();
    this.props.reject();
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save}>Update</Button>
        </div>
        <div className="col-sm-6">
          <Button className="btn-warning" onClick={this.cancel}>Cancel</Button>
        </div>
      </div>);
  }

  render() {
    return ( 
      <Modal show={true} dialogClassName="modal-90w">
        <Modal.Header>
          <Modal.Title>{`WMDA Standard for "${this.props.title}"`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Editor
            apiKey="3w4rqs3iwrm8co1p6sllgs42temdv4t0b748kfshv5yn6u8k"
            init={{ height: (panels.getWindowHeight() - 350) + 'px' }}
            value={this.state.wmdaText2}
            onEditorChange={this.setText} />
        </Modal.Body>
        <Modal.Footer>
          {this.renderButtons()}
        </Modal.Footer>
      </Modal>
    );
  }
}

export function render(title: string, wmdaText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<WMDAForm title={title} wmdaText={wmdaText} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

