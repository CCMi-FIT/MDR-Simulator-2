//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Id, EventB } from '../../../metamodel/ufob';
import * as ufobMeta from '../../../metamodel/ufob';
import * as ufobDB from '../../../db/ufob';
import type { VisModel } from '../../rendering';
import * as panels from '../../panels';

type Props = {
  eventB: EventB,
  ufobVisModel: VisModel
};

type State = {
  eventB2: EventB,
  saveDisabled: boolean
};

function commitEventB(nodes: any, ev: EventB) {
  ufobDB.updateEvent(ev).then((response) => {
    nodes.update({ id: ev.ev_id, label: ev.ev_name });
    panels.hideDialog();
    panels.displayInfo("Event saved.");
  }, (error) => panels.displayError("Event save failed: " + error));
}
  
class EventForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      eventB2: Object.assign({}, props.eventB),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let eventBOriginal = this.props.eventB;
    let val = event.currentTarget.value;
    this.setState((state, props) => {
      let eventBNew = state.eventB2;
      eventBNew[attr] = val;
      return {
        eventB2: eventBNew,
        saveDisabled: R.equals(eventBOriginal, eventBNew)
      };
    });
  }

  save = (event) => {
    let eventBOriginal = this.props.eventB;
    let eventBNew = this.state.eventB2;
    let nodes: any = this.props.ufobVisModel.nodes;
    if (!R.equals(eventBOriginal, eventBNew)) {
      commitEventB(nodes, eventBNew);
    }
  };

  delete = (event) => {
    let nodes: any = this.props.ufobVisModel.nodes;
    let ev_id = this.props.eventB.ev_id;
    ufobDB.deleteEvent(ev_id).then((response) => {
      nodes.remove({ id: ev_id });
      panels.hideDialog();
      panels.displayInfo("Event deleted.");
    }, (error) => panels.displayError("Event delete failed: " + error));
  }

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={(e) => this.setAttr("ev_name", e)} rows="5" cols="30"/>
      </div>);
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update event</Button>
        </div>
        <div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }

  renderButtonDelete() {
    return (
      <Confirm
        onConfirm={this.delete}
        body={`Are you sure you want to delete "${this.props.eventB.ev_name}"?`}
        confirmText="Confirm Delete"
        title="Deleting Event">
        <Button className="btn-danger">Delete event</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>{this.props.eventB.ev_name}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderEventName()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

  componentDidMount() {
    panels.fitPanes();
  }
}

export function render(eventB: EventB, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<EventForm eventB={eventB} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

