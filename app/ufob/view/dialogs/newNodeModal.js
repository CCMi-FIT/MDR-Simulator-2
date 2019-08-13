//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { Id } from '../../../metamodel';
import { Modal } from '../../../components';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as ufobDB from '../../db';
import * as panels from '../../../panels';

type Props = {
  nodeData: any,
  next: State => void
}

type State = {
  selection: "situation" | "event",
  ev_to_situation_id?: Id
};

class NewNodeForm extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = { 
      selection: "situation",
    };
  }

  selectionMade = (event) => {
    let val = event.currentTarget.value;
    this.setState({ selection: val });
  };

  setNodeType = () => {
    const sel = this.state.selection;
    panels.disposeModal();
    this.props.next(
      sel === "event" ? 
        { selection: sel, ev_to_situation_id: this.state.ev_to_situation_id }
      : { selection: sel });
  }

  renderSelection = () => {
    return (
      <div className="form-group"> 
        <select className="form-control" value={this.state.selection} onChange={(ev) => this.selectionMade(ev)}>
          <option key="situation" value="situation">Situation</option>
          <option key="event" value="event">Event</option>
        </select>
      </div>
    );
  }

  renderToSituation = () => {
    const ets = this.state.ev_to_situation_id;
    const toSituation = ets ? [ufobDB.getSituationById(ets)] : [];
    return (
      <div className="form-group"> 
        <label>Resulting Situation:</label>
        <Typeahead
          id="toSituationTA"
          options={ufobDB.getSituations()}
          labelKey={"s_name"}
          selected={toSituation}
          onChange={ss => { 
            if (ss.length > 0) {
              this.setState({ ev_to_situation_id: ss[0].s_id });
            }
          }}
        />
      </div>
    );
  }

  render() {
    return ( 
      <Modal heading="Select new node type:">
        {this.renderSelection()}
        {this.state.selection === "event" ? this.renderToSituation() : ""}
        <button type="button" className="btn-primary" onClick={this.setNodeType}>Select type</button>
      </Modal>
    );
  }
}

export function render(nodeData: any, next: State => void) {
  let panel = panels.getModal();
  if (panel) {
    ReactDOM.render(<NewNodeForm nodeData={nodeData} next={next}/>, panel);
    panels.showModal();
  }
}

