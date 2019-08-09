//@flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, renderConfirmPm } from '../../../components';
import type { UfoaEntity, Association, Connection } from '../../metamodel';
import * as ufoaMeta from '../../metamodel';
import * as ufoaDB from '../../db';
import type { VisModel } from '../../../diagram';
import * as diagram from '../../../diagram';
import * as panels from '../../../panels';
import * as associationDialog from "./associationDialog";

// Props & State {{{1
type Props = {
  ufoaEntity: UfoaEntity,
  ufoaVisModel: VisModel
};

type State = {
  ufoaEntity2: UfoaEntity,
  saveDisabled: boolean
};

// }}}1

function commitEntity(nodes: any, e: UfoaEntity) {
  ufoaDB.updateEntity(e).then(
    () => {
      nodes.update({ id: e.e_id, label: ufoaMeta.entityStr(e), color: ufoaMeta.entityColor(e) });
      panels.disposeDialog();
      panels.displayInfo("Entity saved.");
    },
    error => panels.displayError("Entity save failed: " + error)
  );
}
  
// Component {{{1

class UfoaNodeForm extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      ufoaEntity2: R.clone(props.ufoaEntity),
      saveDisabled: true
    };
  }
  // Operations {{{1
  setAttr = (attr: string, val: any) => {
    let ufoaEntityOriginal = this.props.ufoaEntity;
    this.setState((state) => {
      let ufoaEntityNew = state.ufoaEntity2;
      ufoaEntityNew[attr] = val;
      return {
        ufoaEntity2: ufoaEntityNew,
        saveDisabled: R.equals(ufoaEntityOriginal, ufoaEntityNew)
      };
    });
  }

  save = () => {
    let ufoaEntityOriginal = this.props.ufoaEntity;
    let ufoaEntityNew = this.state.ufoaEntity2;
    let nodes: any = this.props.ufoaVisModel.nodes;
    if (!R.equals(ufoaEntityOriginal, ufoaEntityNew)) {
      commitEntity(nodes, ufoaEntityNew);
    }
  };

  delete = () => {
    const nodes: any = this.props.ufoaVisModel.nodes;
    const edges: any = this.props.ufoaVisModel.edges;
    const e_id = this.props.ufoaEntity.e_id;
    ufoaDB.deleteEntity(e_id).then(
      () => {
        nodes.remove({ id: e_id });
        const edges2remove = edges.get().filter(e => e.from === e_id || e.to === e_id);
        edges.remove(edges2remove.map(e => e.id));
        panels.disposeDialog();
        panels.displayInfo("Entity deleted.");
      },
      error => panels.displayError("Entity delete failed: " + error));
  }
  // Rendering {{{1
  renderEntityType() {
    return (
      <div className="form-group">
        <select className="form-control" value={this.state.ufoaEntity2.e_type} onChange={(e) => this.setAttr("e_type", e.currentTarget.value)}>
          {ufoaMeta.entityTypes.map(et => <option key={et}>{et}</option>)}
        </select>
      </div>);
  }

  renderEntityName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.ufoaEntity2.e_name} onChange={(e) => this.setAttr("e_name", e.currentTarget.value)} rows="5" cols="30"/>
      </div>);
  }

  // AssocPane {{{2
  renderConnection(a: Association, c: Connection, align: string) {
    const prefix =
      R.equals(a.a_connection1, c) ?
        a.a_type === "MemberOf" ?
          !a.a_connection1.mult.upper || a.a_connection1.mult.upper > 1 ? "\u2662" : "\u2666"
        : ""
      : "";
    return (
      <div style={{float: align}}>
        <span style={{fontSize: "22px"}}>{align === "left" ? prefix : ""}</span>
        {c.mult.lower}..{c.mult.upper ? c.mult.upper : "*"}
        <span style={{fontSize: "22px"}}>{align === "right" ? prefix : ""}</span>
      </div>
    );
  }

  renderAssocDetails(a: Association, c1: Connection, c2: Connection) {
    return (
      <div className="container-fluid">
        <div className="row" style={{textAlign: "center", display: "block"}}>
          {ufoaMeta.assocTypeStr(a.a_type)} 
        </div>
        <div className="row" style={{textAlign: "center", display: "block"}}>
          {a.a_label} 
        </div>
        <div className="row" style={{borderTop: "1px solid gray", display: "block"}}>
        </div>
        <div className="row" style={{display: "block"}}>
          <div className="container-fluid">
            <div className="row" style={{display: "block"}}>
              {this.renderConnection(a, c1, "left")}
              {this.renderConnection(a, c2, "right")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderAssoc = (assoc: Association) => {
    const e = this.props.ufoaEntity;
    let e1 = ufoaDB.getEntity1OfAssoc(assoc);
    let c1 = assoc.a_connection1;
    let e2 = ufoaDB.getEntity2OfAssoc(assoc);
    let c2 = assoc.a_connection2;
    if (e1 && e2) {
      console.assert(R.equals(e, e1) || R.equals(e, e2));
      if (e1.e_id !== e.e_id) {
        [e1, e2] = [e2, e1];
        [c1, c2] = [c2, c1];
      }
      return (
        <div key={assoc.a_id} className="d-flex flex-row clickable" style={{marginBottom: "10px"}} 
          onClick={() => associationDialog.render(assoc, this.props.ufoaVisModel)}>
          <div>
            {e1 ? diagram.renderEntity(e1) : ""}
          </div>
          <div>
            {this.renderAssocDetails(assoc, c1, c2)}
          </div>
          <div>
            {e2 ? diagram.renderEntity(e2) : ""}
          </div>
        </div>
      );
    }
  }

  renderAssocPane() {
    return ( 
      <Panel heading="Associations" inner={true}>
        {ufoaDB.getAssocsOfEntity(this.props.ufoaEntity).map(this.renderAssoc)}
      </Panel>
    );
  }
  // }}}2

  // Buttons rendering {{{2
  renderButtons() {
    return (
      <div className="form-group row col-sm-12" style={{paddingTop: "15px"}}> 
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update entity</button>
        </div>
        <div className="col-sm-6  text-center">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }


  renderButtonDelete() {
    return (
      <button type="button" className="btn btn-danger" onClick={() => {
        renderConfirmPm(
          "Deleting Entity",
          "delete",
          <span>Are you sure you want to delete &quot;{ufoaMeta.entityNameLine(this.props.ufoaEntity)}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  // }}}2

  render() {
    return ( 
      <Panel heading={<span>{this.props.ufoaEntity.e_name} ({this.props.ufoaEntity.e_id})</span>}>
        {this.renderEntityType()}
        {this.renderEntityName()}
        {this.renderAssocPane()}
        {this.renderButtons()}
      </Panel>);
  }

}
//}}}1

export function render(ufoaEntity: UfoaEntity, ufoaVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<UfoaNodeForm ufoaEntity={ufoaEntity} ufoaVisModel={ufoaVisModel}/>, panel);
    panels.showDialog();
  }
}

