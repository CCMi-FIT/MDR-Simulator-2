// @flow

// Imports {{{1
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as panels from './panels';

// Panel {{{1
type PanelProps = {
  heading: React.Node,
  inner?: boolean,
  children?: React.Node
};

export function Panel(props: PanelProps) {
  return (
    <div className="card">
      <div className="card-body">
        {props.inner ? 
          <h6 className="card-title">{props.heading}</h6>
        : <h5 className="card-title">{props.heading}</h5>}
        {props.children}
      </div>
    </div>
  );
}

// Modal {{{1

export function Modal(props: PanelProps) {
  return ( 
    <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{props.heading}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}


// Tabs {{{1
type TabsProps = {
  defaultActiveKey: string,
  children?: React.ChildrenArray<React.Element<typeof Tab>>,
};

export function Tabs(props: TabsProps) {
  return (
    <div/>
  );
}

// Tab {{{1

type TabProps = {
  eventKey: string
};

export function Tab(props: TabProps) {
  return (
    <div/>
  );
}

// Confirm {{{1

type ConfirmProps = {
  heading: React.Node,
  subject: string,
  body: React.Node,
  resolve: (any) => any,
  reject: () => void
};

export class Confirm extends React.Component<ConfirmProps> {

  componentDidMount() {
    // $FlowFixMe
    $("#exampleModal").modal("show"); 
  }

  render() {
    return (
      <Modal heading={this.props.heading}>
        <div className="container">
          <div className="row">
            {this.props.body}
          </div>
          <div className="row">
            <button type="button" className="btn btn-danger" onClick={
              () => {
                panels.disposeModal();
                this.props.resolve();
              }}
            >Confirm {this.props.subject}
            </button>
            <button type="button" className="btn btn-outline-danger" onClick={
              () => {
                panels.disposeModal();
                this.props.reject();
              }}
            >Cancel {this.props.subject}</button>
          </div>
        </div>
      </Modal>
    );
  }
}

export function renderConfirmPm(heading: React.Node, subject: string, body: React.Node): Promise<any> {
  return new Promise((resolve, reject) => {
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<Confirm heading={heading} subject={subject} body={body} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

