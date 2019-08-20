// Imports {{{1
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as panels from "./panels";

// Panel {{{1
interface PanelProps {
  heading: React.Node;
  inner?: boolean;
  children?: React.Node;
}

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
    <div className="modal fade" id="app-modal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
//
type TabsProps = {
  activeTab: string,
  id: string,
  children?: any
  //children?: React.ChildrenArray<React.Element<typeof Tab>>,
};

function activeCls(tab, props) {
  const first: boolean = !props.children ? false : tab.props.tabId === props.children[0].props.tabId;
  return first ? " active" : "";
}

export function Tabs(props: TabsProps) {
  return (
    <div>
      <ul className="nav nav-tabs" id={props.id} role="tablist">
        {!props.children ? "" : props.children.map(tab => 
          <li key={tab.props.tabId} className="nav-item">
            <a className={"nav-link" + activeCls(tab, props)} id={`${tab.props.tabId}-tab`} data-toggle="tab" href={`#${tab.props.tabId}`} role="tab">{tab.props.title}</a>
          </li>
        )}
      </ul>
      <div className="tab-content">
      {!props.children ? "" : props.children.map(tab => 
        <div 
          key={tab.props.tabId}
          id={tab.props.tabId}
          className={"tab-pane" + activeCls(tab, props)}
          role="tabpanel">
          {tab.props.children}
        </div>
      )}
    </div>
  </div>
  );
}

// Tab {{{1

type TabProps = {
  tabId: string,
  title: string,
  children?: React.ChildrenArray<React.Element<any>>,
};

export function Tab(props: TabProps) {
  return (
    <div>
      {props.children}
    </div>
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
    panels.showModal();
  }

  render() {
    return (
      <Modal heading={this.props.heading}>
        <div className="container-fluid">
          <div className="row form-group">
            <div className="col my-auto">
              {this.props.body}
            </div>
          </div>
          <div className="row form-grouop">
            <div className="col my-auto">
              <button type="button" className="btn btn-danger" onClick={
                () => {
                  panels.disposeModal();
                  this.props.resolve();
                }}
              >Confirm {this.props.subject}
              </button>
            </div>
            <div className="col my-auto">
              <button type="button" className="btn btn-outline-danger" onClick={
                () => {
                  panels.disposeModal();
                  this.props.reject();
                }}
              >Cancel {this.props.subject}</button>
            </div>
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

