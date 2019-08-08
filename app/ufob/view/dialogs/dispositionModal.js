//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Panel } from '../../../components';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { Id } from '../../../metamodel';
import type { Situation, Disposition } from '../../metamodel';
import * as ufobDB from '../../db';
import * as panels from '../../../panels';

type Props = {
  situation: Situation,
  disposition: Disposition,
  resolve: any,
  reject: () => void
};

type State = {
  disposition2: Disposition,
  duplicityError: boolean,
  saveDisabled: boolean
};

class DispositionForm extends React.Component<Props, State> {

  typeahead: any = null;

  constructor(props) {
    super(props);
    this.state = {
      disposition2: R.clone(props.disposition),
      duplicityError: false,
      saveDisabled: true
    };
  }

  // Operations {{{1

  setText = (val: string) => {
    this.setState((state: State, props: Props) => {
      const newD = R.mergeDeepRight(state.disposition2, { d_text: val }); 
      if (props.situation.s_dispositions.find(d => d.d_text === val)) {
        return R.mergeDeepRight(state, { 
          disposition2: newD,
          duplicityError: true,
          saveDisabled: true });
      } else {
        return R.mergeDeepRight(state, { 
          disposition2: newD,
          duplicityError: false,
          saveDisabled: false });
      }
    });
  }

  save = () => {
    let dOrig = this.props.disposition;
    let dNew = this.state.disposition2;
    panels.disposeModal();
    if (!R.equals(dNew, dOrig)) {
      this.props.resolve(dNew);
    } else {
      this.props.reject();
    }
  }

  deleteEvent = (ev_id: Id) => {
    const newIds = this.state.disposition2.d_events_ids.filter(eId => eId !== ev_id);
    const newDisposition = R.mergeDeepRight(this.state.disposition2, { d_events_ids: newIds });
    const hasError = newDisposition.d_events_ids.length === 0;
    this.setState({ 
      disposition2: newDisposition, 
      saveDisabled: hasError
    });
  }

  addEvent = (ev_id: Id) => {
    const newIds = R.append(ev_id, this.state.disposition2.d_events_ids);
    const newDisposition = R.mergeDeepRight(this.state.disposition2, { d_events_ids: newIds });
    this.setState({ 
      disposition2: newDisposition, 
      saveDisabled: false });
  }
  
  delete = () => {
    this.props.resolve(null);
    panels.disposeModal();
  }

  // Rendering {{{1

  renderDispositionText() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.disposition2.d_text} onChange={e => this.setText(e.currentTarget.value)} rows="5" cols="30"/>
        {this.state.duplicityError ? 
            <span className="error-hint">Duplicate disposition</span>
          : ""}
      </div>);
  }

  renderEvent = (ev_id: Id) => {
    const ev = ufobDB.getUfobEventById(ev_id);
    return (
      <div key={ev_id} className="badge-item">
        <span className="badge text-primary">{ev ? ev.ev_name : ""}
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
      <span className="error-hint">There must be at least one caused event.</span>
    );
  }

  renderEvents() {
    const esIds = this.state.disposition2.d_events_ids;
    return ( 
      <Panel heading="Events caused">
        {esIds.length === 0 ?
            this.renderEventsEmpty()
          : esIds.map(this.renderEvent)}
        <Typeahead
          id="eventsTA"
          ref={(typeahead) => this.typeahead = typeahead}
          options={ufobDB.getEvents().filter(ev => esIds.indexOf(ev.ev_id) < 0)}
          labelKey={"ev_name"}
          onChange={evs => { 
            if (evs.length > 0) { 
              this.addEvent(evs[0].ev_id);
              this.typeahead.getInstance().clear();
            }
          }}
        />
      </Panel>
    );
  }
  
  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-4 text-center">
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={this.save} 
            disabled={this.state.saveDisabled}>
            Update disposition
          </button>
        </div>
        <div className="col-sm-4 text-center">
          <button type="button" className="btn btn-danger" onClick={() => this.delete()}>Delete disposition</button>
        </div>
        <div className="col-sm-4 text-center">
          <button type="button" className="btn btn-warning" onClick={() => panels.disposeModal()}>Cancel</button>
        </div>
      </div>);
  }

  render() {
    return ( 
      <Modal heading={<strong>Disposition</strong>}>
        {this.renderDispositionText()}
        {this.renderEvents()}
        {this.renderButtons()}
      </Modal>
    );
  }
}

// }}}1

export function render(situation: Situation, disposition: Disposition): Promise<any> {
  return new Promise((resolve, reject) => {
    let panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<DispositionForm situation={situation} disposition={disposition} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}

