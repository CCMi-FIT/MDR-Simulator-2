import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Modal, Panel } from "../../../components";
import { Typeahead } from "react-bootstrap-typeahead";
import { Id } from "../../../metamodel";
import { UfobEvent, Situation, Disposition } from "../../metamodel";
import * as ufobDB from "../../db";
import * as panels from "../../../panels";

interface Props {
  situation: Situation;
  disposition: Disposition;
  resolve: any;
  reject: () => void;
}

interface State {
  disposition2: Disposition;
  duplicityError: boolean;
  saveDisabled: boolean;
}

class DispositionForm extends React.Component<Props, State> {

  private modalRef: any;
  private typeahead: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      disposition2: _.clone(props.disposition),
      duplicityError: false,
      saveDisabled: true
    };
  }

  // Events {{{1

  private dispositionTextChanged = (e: React.ChangeEvent) => {
    const t = e.currentTarget as HTMLTextAreaElement;
    this.setText(t.value);
  }

  // Operations {{{1
  private setText = (val: string) => {
    this.setState((state: State, props: Props) => {
      const newD: Disposition = {
	...state.disposition2,
	d_text: val
      };
      const newS: State = (props.situation.s_dispositions.find((d) => d.d_text === val) ?
	({
	  ...state,
          disposition2: newD,
          duplicityError: true,
	  saveDisabled: true 
        })
      : ({
	  ...state,
          disposition2: newD,
          duplicityError: false,
	  saveDisabled: false
        })
      );
      return newS;
    });
  }

  private save = () => {
    const dOrig = this.props.disposition;
    const dNew = this.state.disposition2;
    this.modalRef.hide();
    if (!_.isEqual(dNew, dOrig)) {
      this.props.resolve(dNew);
    } else {
      this.props.reject();
    }
  }

  private deleteEvent = (evId: Id) => {
    this.setState((state: State, props: Props) => {
      const newIds = state.disposition2.d_events_ids.filter((eId) => eId !== evId);
      const newDisposition = {
	...state.disposition2,
	d_events_ids: newIds
      };
      const hasError = newDisposition.d_events_ids.length === 0;
      return {
	disposition2: newDisposition,
	saveDisabled: hasError
      };
    });
  }

  private addEvent = (evId: Id) => {
    this.setState((state: State, props: Props) => {
      const newIds = [ ...state.disposition2.d_events_ids, evId ];
      const newDisposition = {
	...state.disposition2,
	  d_events_ids: newIds
      };
      return {
	disposition2: newDisposition,
	saveDisabled: false 
      };
    });
  }

  private delete = () => {
    this.modalRef.hide();
    this.props.resolve(null);
  }

  private cancel = () => {
    this.modalRef.hide();
    this.props.reject();
  }

  // Rendering {{{1
  private renderDispositionText = () => {
    return (
      <div className="form-group">
        <textarea className="form-control" value={this.state.disposition2.d_text} onChange={this.dispositionTextChanged} rows={5} cols={30}/>
        {this.state.duplicityError ?
            <span className="error-hint">Duplicate disposition</span>
          : ""}
      </div>
    );
  }

  private renderEvent = (evId: Id) => {
    const ev = ufobDB.getUfobEventById(evId);
    return (
      <div key={evId} style={{marginBottom: "5px"}}>
        <div className="badge badge-pill badge-primary d-flex flex-row" style={{fontSize: "100%", whiteSpace: "normal"}}>
          <div className="mr-auto my-auto" style={{marginRight: "0.5em"}}>
            {ev ? ev.ev_name : ""}
          </div>
          <div className="my-auto">
            <a href="#" style={{fontSize: "16px"}}
              className="badge badge-pill badge-primary"
              onClick={() => this.deleteEvent(evId)}>x</a>
          </div>
        </div>
      </div>
    );
  }

  private renderEventsEmpty = () => {
    return (
      <span className="error-hint">There must be at least one caused event.</span>
    );
  }

  private renderEvents = () => {
    const esIds = this.state.disposition2.d_events_ids;
    return (
      <div className="form-group">
        <Panel heading="Events caused" inner={true}>
          {esIds.length === 0 ?
              this.renderEventsEmpty()
            : esIds.map(this.renderEvent)}
          <Typeahead
            id="eventsTA"
            ref={(typeahead: any) => this.typeahead = typeahead}
            options={ufobDB.getEvents().filter((ev) => esIds.indexOf(ev.ev_id) < 0)}
            labelKey={"ev_name"}
            onChange={(evs: UfobEvent[]) => {
              if (evs.length > 0) {
                this.addEvent(evs[0].ev_id);
                this.typeahead.getInstance().clear();
              }
            }}
          />
        </Panel>
      </div>
    );
  }

  private renderButtons = () => {
    return (
      <div className="form-group d-flex flex-row">
        <button
        type="button"
        className="btn btn-primary mr-auto"
        onClick={this.save}
        disabled={this.state.saveDisabled}>
          Update disposition
        </button>
        <button type="button" className="btn btn-danger mr-auto" onClick={() => this.delete()}>Delete disposition</button>
        <button type="button" className="btn btn-warning mr-auto" onClick={() => this.cancel()}>Cancel</button>
      </div>
    );
  }

  public render = () => {
    return (
      <Modal heading={<strong>Disposition</strong>} ref={(mRef) => this.modalRef = mRef}>
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
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<DispositionForm situation={situation} disposition={disposition} resolve={resolve} reject={reject}/>, panel);
    }
  });
}
