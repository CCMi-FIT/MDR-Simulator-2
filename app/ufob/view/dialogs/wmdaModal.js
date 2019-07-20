//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal } from '../../../components';
import CKEditor from "react-ckeditor-component";
//import { Editor } from '@tinymce/tinymce-react';
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

  setText = (evt: any) => {
    let val = evt.editor.getData();
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
          <button type="button" className="btn btn-primary" onClick={this.save}>Update</button>
        </div>
        <div className="col-sm-6">
          <button type="button" className="btn btn-warning" onClick={this.cancel}>Cancel</button>
        </div>
      </div>
    );
  }

  render() {
    return ( 
      <Modal heading={<span>WMDA Standard for {this.props.title}</span>}>
        <CKEditor 
          activeClass="p10" 
          content={this.state.wmdaText2} 
          events={{
            "change": this.setText
          }}
        />
        {this.renderButtons()}
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

