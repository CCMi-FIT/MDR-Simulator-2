// @flow

// Imports {{{1
import * as React from 'react';

// Panel {{{1
type PanelProps = {
  heading: React.Node,
  children?: React.Node
};

export function Panel(props: PanelProps) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">props.heading</h5>
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
