//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { EventB } from '../../../metamodel/ufob';
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
  ufobDB.updateEvent(ev).then(() => {
    nodes.update({ id: ev.ev_id, label: ev.ev_name });
    panels.hideDialog();
    panels.displayInfo("Event saved.");
  }, (error) => panels.displayError("Event save failed: " + error));
}
  
class EventForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      eventB2: R.clone(props.eventB),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, val: any) => {
    let eventBOriginal = this.props.eventB;
    this.setState((state) => {
      let eventBNew = state.eventB2;
      eventBNew[attr] = val;
      return {
        eventB2: eventBNew,
        saveDisabled: R.equals(eventBOriginal, eventBNew)
      };
    });
  }

  save = () => {
    let eventBOriginal = this.props.eventB;
    let eventBNew = this.state.eventB2;
    let nodes: any = this.props.ufobVisModel.nodes;
    if (!R.equals(eventBOriginal, eventBNew)) {
      commitEventB(nodes, eventBNew);
    }
  };

  delete = () => {
    let nodes: any = this.props.ufobVisModel.nodes;
    let ev_id = this.props.eventB.ev_id;
    ufobDB.deleteEvent(ev_id).then(() => {
      nodes.remove({ id: ev_id });
      panels.hideDialog();
      panels.displayInfo("Event deleted.");
    }, (error) => panels.displayError("Event delete failed: " + error));
  }

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={(e) => this.setAttr("ev_name", e.currentTarget.value)} rows="5" cols="30"/>
      </div>);
  }

  renderToSituation = () => {
    const toSituation = ufobDB.getSituationById(this.state.eventB2.ev_to_situation_id);
    return (
      <div className="form-group">
        <label>To situation:</label>
        <Typeahead
          options={ufobDB.getSituations()}
          labelKey={"s_name"}
          selected={[toSituation]}
          onChange={ss => { 
            if (ss.length > 0) {
              this.setAttr("ev_to_situation_id", ss[0].s_id);
            }
          }}
        />
      </div>
    );
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
          {this.renderToSituation()}
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

