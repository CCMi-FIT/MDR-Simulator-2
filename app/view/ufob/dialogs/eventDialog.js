//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { EventB, Operation } from '../../../metamodel/ufob';
import * as ufobDB from '../../../db/ufob';
import type { VisModel } from '../../rendering';
import * as rendering from '../canvas/rendering';
import * as panels from '../../panels';

type Props = {
  eventB: EventB,
  ufobVisModel: VisModel
};

type State = {
  eventB2: EventB,
  saveDisabled: boolean
};

class EventForm extends React.Component<Props, State> {

  typeahead: any = null;
  
  constructor(props) {
    super(props);
    this.state = {
      eventB2: R.clone(props.eventB),
      saveDisabled: true
    };
  }

  // Operations {{{1

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

  commit = () => {
    const ev = this.state.eventB2;
    const nodes = this.props.ufobVisModel.nodes;
    const edges = this.props.ufobVisModel.edges;
    ufobDB.updateEvent(ev).then(() => {
      nodes.update({ id: ev.ev_id, label: ev.ev_name });
      const edgesIds = edges.get().filter(e => e.from === ev.ev_id).map(e => e.id); //Effectively, there should be just one edge
      edges.remove(edgesIds);
      edges.add(rendering.mkEdge(ev.ev_id, ev.ev_to_situation_id));
      panels.hideDialog();
      panels.displayInfo("Event saved.");
    }, (error) => panels.displayError("Event save failed: " + error));
  }
  
  save = () => {
    let eventBOriginal = this.props.eventB;
    let eventBNew = this.state.eventB2;
    if (!R.equals(eventBOriginal, eventBNew)) {
      this.commit();
    }
  };

  delete = () => {
    const nodes: any = this.props.ufobVisModel.nodes;
    const edges: any = this.props.ufobVisModel.edges;
    const ev_id = this.props.eventB.ev_id;
    ufobDB.deleteEvent(ev_id).then(
      () => {
        nodes.remove({ id: ev_id });
        const edges2remove = edges.get().filter(e => e.from === ev_id || e.to === ev_id);
        edges.remove(edges2remove.map(e => e.id));
        panels.hideDialog();
        panels.displayInfo("Event deleted.");
      },
      error => panels.displayError("Event delete failed: " + error));
  }

  // Rendering {{{1

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={(e) => this.setAttr("ev_name", e.currentTarget.value)} rows="3" cols="30"/>
      </div>);
  }

  renderOperation = (op: Operation) => {
    const opSymbol = 
          op.opa_id ? <span>+</span> 
        : op.opr_id ? <span>-</span>
        : <span>??</span>;
    return (
      {opSymbol}
      //<div key={ev_id} className="badge-item">
        //<span className="badge badge-info">{ev ? ev.ev_name : ""}
          //{" "}
          //<span 
            //className="badge badge-error clickable"
            //onClick={() => this.deleteEvent(ev_id)}>X</span>
        //</span>
      //</div>
    );
  }

  renderOperations = () => {
    return (
      <div className="form-group">
        <Panel className="dialog">
          <Panel.Heading>Operations</Panel.Heading>
          <Panel.Body collapsible={false}>
            {this.state.eventB2.ev_ops.map(this.renderOperation)}
            {/*TODO:
              <Typeahead
                ref={(typeahead) => this.typeahead = typeahead}
                options={ufobDB.getEvents().filter(ev => esIds.indexOf(ev.ev_id) < 0)}
                labelKey={"ev_name"}
                onChange={evs => { 
                  if (evs.length > 0) { 
                    this.addEvent(evs[0].ev_id);
                    this.typeahead.getInstance().clear();
                  }
                }}
              />*/}
            </Panel.Body>
          </Panel>
      </div>
    );
  }

  renderToSituation = () => {
    const toSituation = ufobDB.getSituationById(this.state.eventB2.ev_to_situation_id);
    return (
      <div className="form-group">
        <label>Resulting situation:</label>
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

  // Buttons {{{2

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

  // }}}2

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>{this.props.eventB.ev_name}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderEventName()}
          {this.renderOperations()}
          {this.renderToSituation()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

  componentDidMount() {
    panels.fitPanes();
  }
}

///}}}1

export function render(eventB: EventB, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<EventForm eventB={eventB} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

