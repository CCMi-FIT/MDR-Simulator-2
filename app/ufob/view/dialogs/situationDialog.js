//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Situation, Disposition } from '../../metamodel';
import type { Id } from '../../../metamodel.js';
import * as ufobMeta from '../../metamodel';
import * as ufobModel from '../../model';
import * as ufobDB from '../../db';
import type { VisModel } from '../../../diagram';
import * as diagram from '../diagram';
import * as panels from '../../../panels';
import * as dispositionModal from './dispositionModal';
import * as wmdaModal from './wmdaModal';

type Props = {
  situation: Situation,
  ufobVisModel: VisModel
};

type State = {
  situation2: Situation,
  saveDisabled: boolean
};

class SituationForm extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      situation2: Object.assign({}, props.situation),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  updateEdges = () => {
    const nodes = this.props.ufobVisModel.nodes;
    const edges = this.props.ufobVisModel.edges;
    const sId = nodes.get().find(node => node.id === this.state.situation2.s_id).id;
    if (!sId) { 
      console.error("Internal inconsistency in situationDialog/updateEdges");
    } else {
      const edgesIds = edges.get({ filter: edge => edge.from === sId }).map(edge => edge.id);
      edges.remove(edgesIds);
      this.state.situation2.s_dispositions.forEach(d => {
        d.d_events_ids.forEach(evId => {
          const newEdge = diagram.mkEdge(sId, evId, d.d_text);
          edges.add(newEdge);
        });
      });
    }
  }

  commitSituation = (nodes: any, s: Situation) => {
    ufobDB.updateSituation(s).then(
      () => {
        nodes.update({ id: s.s_id, label: s.s_name });
        this.updateEdges();
        panels.disposeDialog();
        panels.displayInfo("Situation saved.");
      },
      error => panels.displayError("Situation save failed: " + error)
    );
  }
  
  setAttr = (attr: string, val: any) => {
    this.setState((state: State, props: Props) => {
      //let stateCopy = R.clone(state); // Just because Flow bitches about state in R.dissocPath
      let sOrig = props.situation;
      let stateNew = 
        R.mergeDeepRight(state, { situation2: { [attr]: val }});
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(sOrig, stateNew.situation2) });
    });
  }

  save = () => {
    let situationOriginal = this.props.situation;
    let situationNew = this.state.situation2;
    let nodes: any = this.props.ufobVisModel.nodes;
    if (!R.equals(situationOriginal, situationNew)) {
      this.commitSituation(nodes, situationNew);
    }
  };

  delete = () => {
    const nodes: any = this.props.ufobVisModel.nodes;
    const edges: any = this.props.ufobVisModel.edges;
    const s_id = this.props.situation.s_id;
    ufobDB.deleteSituation(s_id).then(
      () => {
        nodes.remove({ id: s_id });
        const edges2remove = edges.get().filter(e => e.from === s_id || e.to === s_id);
        edges.remove(edges2remove.map(e => e.id));
        panels.disposeDialog();
        panels.displayInfo("Situation deleted.");
      },
      error => panels.displayError("Situation delete failed: " + error));
  }

  editWMDA = () => {
    const situation2 = this.state.situation2;
    wmdaModal.render(situation2.s_name, situation2.s_wmda_text).then(
      wmdaText2 => this.setAttr("s_wmda_text", wmdaText2)
    );
  }

  renderSituationName = () => {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.situation2.s_name} onChange={(e) => this.setAttr("s_name", e.currentTarget.value)} rows="3" cols="30"/>
      </div>);
  }

  renderEvent = (ev_id: Id) => {
    const ev = ufobDB.getUfobEventById(ev_id);
    return (
      <div key={ev_id}>
        <i className="glyphicon glyphicon-arrow-right"></i>
        <span>{ev ? ev.ev_name : ""}</span>
      </div>
    );
  }

  editDisposition = (d: Disposition) => {
    dispositionModal.render(this.state.situation2, d).then(
      dNew => {
        if (!dNew) {
          const newS = ufobModel.deleteDisposition(this.state.situation2, d.d_text);
          this.setState({ situation2: newS, saveDisabled: false });
        } else {
          const newS = ufobModel.withUpdatedDisposition(this.state.situation2, d.d_text, dNew);
          this.setState({ situation2: newS, saveDisabled: false });
        }
      }
    );
  }

  addDisposition = () => {
    dispositionModal.render(this.state.situation2, ufobMeta.emptyDisposition).then(
      dNew => {
        let newS = ufobModel.addDisposition(this.state.situation2, dNew);
        this.setState({ situation2: newS, saveDisabled: false });
      }
    );
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
        </tr>
    );
  }

  renderDispositions = () => {
    return ( 
      <table className="table table-striped">
        <thead>
          <tr><th colSpan="2">Dispositions</th></tr>
        </thead>
        <tbody>
          {this.state.situation2.s_dispositions.map(this.renderDispositionRow)}
          <tr>
            <td colSpan="2">
              <Button className="btn-primary btn-sm" onClick={this.addDisposition}><i className="glyphicon glyphicon-plus"></i></Button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderWMDAButton = () => {
    return (
      <div className="form-group row col-sm-12">
        <Button className="col-sm-12 btn-primary" onClick={this.editWMDA}>Edit WMDA Standard</Button>
      </div>);
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
      <Panel className="dialog-panel">
        <Panel.Heading><strong>Situation {this.props.situation.s_id}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderSituationName()}
          {this.renderDispositions()}
          {this.renderWMDAButton()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

}

export function render(situation: Situation, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<SituationForm situation={situation} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

