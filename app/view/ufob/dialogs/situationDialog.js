//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Situation, Disposition } from '../../../metamodel/ufob';
import type { Id } from '../../../metamodel/general.js';
import * as ufobModel from '../../../model/ufob';
import * as ufobDB from '../../../db/ufob';
import type { VisModel } from '../../rendering';
import * as panels from '../../panels';
import * as dispositionModal from './dispositionModal';

type Props = {
  situation: Situation,
  ufobVisModel: VisModel
};

type State = {
  situation2: Situation,
  saveDisabled: boolean
};

function commitSituation(nodes: any, s: Situation) {
  ufobDB.updateSituation(s).then((response) => {
    nodes.update({ id: s.s_id, label: s.s_name });
    //TODO bude asi potreba prekreslit celou sit: musi se aktualizovat hrany dispozic a vysledne eventy...
    panels.hideDialog();
    panels.displayInfo("Situation saved.");
  }, (error) => panels.displayError("Situation save failed: " + error));
}
  
class SituationForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      situation2: Object.assign({}, props.situation),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let val = event.currentTarget.value;
    this.setState((state: State, props: Props) => {
      //let stateCopy = R.clone(state); // Just because Flow bitches about state in R.dissocPath
      let sOrig = props.situation;
      let stateNew = 
        attr === "s_name" ?
          R.mergeDeepRight(state, { situation2: { s_name: val }})
        : (() => {
            console.error(`SituationForm: setAttr of ${attr} not implemented`);
            return R.mergeDeepRight(state, {});
          })();
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(sOrig, stateNew.situation2) });
    });
  }

  save = (situation) => {
    let situationOriginal = this.props.situation;
    let situationNew = this.state.situation2;
    let nodes: any = this.props.ufobVisModel.nodes;
    if (!R.equals(situationOriginal, situationNew)) {
      commitSituation(nodes, situationNew);
    }
  };

  delete = (situation) => {
    let nodes: any = this.props.ufobVisModel.nodes;
    let s_id = this.props.situation.s_id;
    ufobDB.deleteSituation(s_id).then((response) => {
      nodes.remove({ id: s_id });
      panels.hideDialog();
      panels.displayInfo("Situation deleted.");
    }, (error) => panels.displayError("Situation delete failed: " + error));
  }

  renderSituationName = () => {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.situation2.s_name} onChange={(e) => this.setAttr("s_name", e)} rows="5" cols="30"/>
      </div>);
  }

  renderEvent = (ev_id: Id) => {
    const ev = ufobDB.getEventById(ev_id);
    return (
      <span key={ev_id}>
        <i className="glyphicon glyphicon-arrow-right"></i>
        <span>{ev ? ev.ev_name : ""}</span>
      </span>
    );
  }

  editDisposition = (d: Disposition) => {
    dispositionModal.render(d).then((dNew) => {
      let newS = ufobModel.withUpdatedDisposition(this.state.situation2, d.d_text, dNew);
      this.setState({ situation2: newS, saveDisabled: false });
    });
  }

  renderDispositionRow = (d: Disposition) => {
    return (
      <tr className="clickable" key={d.d_text} onClick={() => this.editDisposition(d)}>
        <td>
          {d.d_text ? d.d_text : "<Implicit>"}
          </td>
          <td>
            {d.d_events_ids.map(this.renderEvent)}
          </td>
          {/*<td>
            <Button className="btn-danger btn-sm">
              <i className="glyphicon glyphicon-trash"></i>
            </Button>
          </td>*/}
        </tr>
    );
  }

        //<textarea className="form-control" type="text" value={d.d_text} onChange={(e) => this.setAttr("d_text", e)} rows="5" cols="30"/>

  renderDispositions = () => {
    return ( 
      <table className="table table-striped">
        <tbody>
          {this.state.situation2.s_dispositions.map(this.renderDispositionRow)}
        </tbody>
      </table>
    );
  }

  renderButtons = () => {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update situation</Button>
        </div>
        <div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }

  renderButtonDelete = () => {
    return (
      <Confirm
        onConfirm={this.delete}
        body={`Are you sure you want to delete "${this.props.situation.s_name}"?`}
        confirmText="Confirm Delete"
        title="Deleting Situation">
        <Button className="btn-danger">Delete situation</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>Situation</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderSituationName()}
          {this.renderDispositions()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

  componentDidMount() {
    panels.fitPanes();
  }
}

export function render(situation: Situation, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<SituationForm situation={situation} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

