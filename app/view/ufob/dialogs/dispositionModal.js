//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Panel, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { Id } from '../../../metamodel/general';
import type { Situation, Disposition } from '../../../metamodel/ufob';
import * as ufobDB from '../../../db/ufob';
import * as panels from '../../panels';

type Props = {
  situation: Situation,
  disposition: Disposition,
  resolve: any,
  reject: () => void
};

type State = {
  disposition2: Disposition,
  updateHint: string,
  saveDisabled: boolean
};

class DispositionForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      disposition2: R.clone(props.disposition),
      updateHint: "",
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setTextHandler = (event: any) => {
    const val = event.currentTarget.value;
    this.setState((state: State, props: Props) => {
      const newD = R.mergeDeepRight(state.disposition2, { d_text: val }); 
      if (props.situation.s_dispositions.find(d => d.d_text === val)) {
        return R.mergeDeepRight(state, { 
          disposition2: newD,
          updateHint: "Disposition already exists",
          saveDisabled: true });
      } else {
        return R.mergeDeepRight(state, { 
          disposition2: newD,
          updateHint: "",
          saveDisabled: false });
      }
    });
  }

  save = () => {
    let dOrig = this.props.disposition;
    let dNew = this.state.disposition2;
    panels.hideModal();
    if (!R.equals(dNew, dOrig)) {
      this.props.resolve(this.state.disposition2);
    } else {
      this.props.reject();
    }
    panels.hideModal();
  }

  deleteEvent = (ev_id: Id) => {
    const newIds = this.state.disposition2.d_events_ids.filter(eId => eId !== ev_id);
    const newDisposition = R.mergeDeepRight(this.state.disposition2, { d_events_ids: newIds });
    const disableSave = newDisposition.d_events_ids.length === 0;
    this.setState({ 
      disposition2: newDisposition, 
      saveDisabled: disableSave
    });
  }

  addEvent = (ev_id: Id) => {
    const newIds = R.append(ev_id, this.state.disposition2.d_events_ids);
    const newDisposition = R.mergeDeepRight(this.state.disposition2, { d_events_ids: newIds });
    this.setState({ disposition2: newDisposition, saveDisabled: false });
  }
  
  delete = () => {
    this.props.resolve(null);
    panels.hideModal();
  }

  renderDispositionText() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.disposition2.d_text} onChange={e => this.setTextHandler(e)} rows="5" cols="30"/>
      </div>);
  }

  renderEvent = (ev_id: Id) => {
    const ev = ufobDB.getEventById(ev_id);
    return (
      <div key={ev_id} className="badge-item">
        <span className="badge badge-info">{ev ? ev.ev_name : ""}
          {" "}
          <span 
            className="badge badge-error clickable"
            onClick={() => this.deleteEvent(ev_id)}>X</span>
        </span>
      </div>
    );
  }

  renderEventsEmpty() {
    return (
      <div className="badge-item">
        <span className="badge badge-error clickable" title="There must be at least one caused event">!</span>
      </div>
    );
  }

  renderEvents() {
    const esIds = this.state.disposition2.d_events_ids;
    return ( 
      <Panel className="dialog">
        <Panel.Heading>Events caused</Panel.Heading>
        <Panel.Body collapsible={false}>
          {esIds.length === 0 ?
              this.renderEventsEmpty()
            : esIds.map(this.renderEvent)}
          <Typeahead
            options={ufobDB.getEvents().filter(ev => esIds.indexOf(ev.ev_id) < 0)}
            labelKey={"ev_name"}
            onChange={evs => { 
              if (evs.length > 0) { 
                this.addEvent(evs[0].ev_id);
              }
            }}
          />
        </Panel.Body>
      </Panel>);
  }
  
  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-4">
          <Button 
            className="btn-primary" 
            onClick={this.save} 
            title={this.state.updateHint}
            disabled={this.state.saveDisabled}>
            Update disposition
          </Button>
        </div>
        <div className="col-sm-4">
          <Button className="btn-danger" onClick={() => this.delete()}>Delete disposition</Button>
        </div>
        <div className="col-sm-4">
          <Button className="btn-warning" onClick={() => panels.hideModal()}>Cancel</Button>
        </div>
      </div>);
  }

  render() {
    return ( 
      <Modal.Dialog>
          <Panel className="dialog">
            <Panel.Heading><strong>Disposition</strong></Panel.Heading>
            <Panel.Body collapsible={false}>
              {this.renderDispositionText()}
              {this.renderEvents()}
              {this.renderButtons()}
            </Panel.Body>
          </Panel>
      </Modal.Dialog>);
  }
}

export function render(situation: Situation, disposition: Disposition): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<DispositionForm situation={situation} disposition={disposition} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

