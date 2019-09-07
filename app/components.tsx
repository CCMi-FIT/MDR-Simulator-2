// Imports {{{1
import { Promise } from "es6-promise";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as panels from "./panels";

// Panel {{{1
interface PanelProps {
  heading: React.ReactNode;
  inner?: boolean;
  children?: React.ReactNode;
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
    <div className="modal fade" id="app-modal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
interface TabsProps {
  activeTab: string;
  id: string;
  children?: any;
}

function activeCls(tab: React.ReactElement, props: TabsProps) {
  if (tab) {
    const first: boolean = !props.children ? false : tab.props.tabId === props.children[0].props.tabId;
    return first ? " active" : "";
  } else {
    return "";
  }
}

export function Tabs(props: TabsProps) {
  return (
    <div>
      <ul className="nav nav-tabs" id={props.id} role="tablist">
        {!props.children ? "" : props.children.map((tab: React.ReactElement) =>
          <li key={tab.props.tabId} className="nav-item">
            <a className={"nav-link" + activeCls(tab, props)} id={`${tab.props.tabId}-tab`} data-toggle="tab" href={`#${tab.props.tabId}`} role="tab">{tab.props.title}</a>
          </li>
        )}
      </ul>
      <div className="tab-content">
      {!props.children ? "" : props.children.map((tab: React.ReactElement) =>
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
interface TabProps {
  tabId: string;
  title: string;
  children?: any;
}

export function Tab(props: TabProps) {
  return (
    <div>
      {props.children}
    </div>
  );
}

// Confirm {{{1

interface ConfirmProps {
  heading: React.ReactNode;
  subject: string;
  body: React.ReactNode;
  resolve: () => any;
  reject: () => void;
}

export class Confirm extends React.Component<ConfirmProps> {

  public componentDidMount = () => {
    panels.showModal();
  }

  public render = () => {
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

export function renderConfirmPm(heading: React.ReactNode, subject: string, body: React.ReactNode): Promise<any> {
  return new Promise((resolve, reject) => {
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<Confirm heading={heading} subject={subject} body={body} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

