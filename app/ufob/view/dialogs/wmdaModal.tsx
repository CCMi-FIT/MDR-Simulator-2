import * as React from "react";
import * as ReactDOM from "react-dom";
import { Modal } from "../../../components";
import CKEditor from "react-ckeditor-component";
import * as panels from "../../../panels";

interface Props {
  title: string;
  wmdaText: string;
  resolve: any;
  reject: () => void;
}

interface State {
  wmdaText2: string
}

class WMDAForm extends React.Component<Props, State> {

  private modalRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      wmdaText2: props.wmdaText
    };
  }

  private setText = (evt: any) => {
    const val = evt.editor.getData();
    this.setState({ wmdaText2: val });
  }

  private save = () => {
    this.modalRef.hide();
    this.props.resolve(this.state.wmdaText2);
  }

  private cancel = () => {
    this.modalRef.hide();
    this.props.reject();
  }

  private renderButtons = () => {
    return (
      <div className="form-group row col-sm-12">
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-primary" onClick={this.save}>Update</button>
        </div>
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-warning" onClick={this.cancel}>Cancel</button>
        </div>
      </div>
    );
  }

  public render = () => {
    return (
      <Modal heading={<span>WMDA Standard for {this.props.title}</span>} ref={(mRef) => this.modalRef = mRef} width="1000px">
        <CKEditor
        activeClass="p10"
        content={this.state.wmdaText2}
        events={{
          change: this.setText
        }}/>
        {this.renderButtons()}
      </Modal>
    );
  }
}

export function render(title: string, wmdaText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<WMDAForm title={title} wmdaText={wmdaText} resolve={resolve} reject={reject}/>, panel);
    }
  });
}
