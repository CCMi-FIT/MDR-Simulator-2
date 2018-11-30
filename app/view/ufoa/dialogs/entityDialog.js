//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { UfoaEntity, Association, Connection } from '../../../metamodel/ufoa';
import * as ufoaMeta from '../../../metamodel/ufoa';
import * as ufoaDB from '../../../db/ufoa';
import type { VisModel } from '../../rendering';
import * as panels from '../../panels';
import * as associationDialog from "./associationDialog";

type Props = {
  ufoaEntity: UfoaEntity,
  ufoaVisModel: VisModel
};

type State = {
  ufoaEntity2: UfoaEntity,
  saveDisabled: boolean
};

function commitEntity(nodes: any, e: UfoaEntity) {
  ufoaDB.updateEntity(e).then((response) => {
    nodes.update({ id: e.e_id, label: ufoaMeta.entityStr(e) });
    panels.hideDialog();
    panels.displayInfo("Entity saved.");
  }, (error) => panels.displayError("Entity save failed: " + error));
}
  
class UfoaNodeForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      ufoaEntity2: Object.assign({}, props.ufoaEntity),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let ufoaEntityOriginal = this.props.ufoaEntity;
    let val = event.currentTarget.value;
    this.setState((state, props) => {
      let ufoaEntityNew = state.ufoaEntity2;
      ufoaEntityNew[attr] = val;
      return {
        ufoaEntity2: ufoaEntityNew,
        saveDisabled: R.equals(ufoaEntityOriginal, ufoaEntityNew)
      };
    });
  }

  save = (event) => {
    let ufoaEntityOriginal = this.props.ufoaEntity;
    let ufoaEntityNew = this.state.ufoaEntity2;
    let nodes: any = this.props.ufoaVisModel.nodes;
    if (!R.equals(ufoaEntityOriginal, ufoaEntityNew)) {
      commitEntity(nodes, ufoaEntityNew);
    }
  };

  delete = (event) => {
    let nodes: any = this.props.ufoaVisModel.nodes;
    let e_id = this.props.ufoaEntity.e_id;
    ufoaDB.deleteEntity(e_id).then((response) => {
      nodes.remove({ id: e_id });
      panels.hideDialog();
      panels.displayInfo("Entity deleted.");
    }, (error) => panels.displayError("Entity delete failed: " + error));
  }

  renderEntityType() {
    return (
      <div className="form-group">
        <select className="form-control" value={this.state.ufoaEntity2.e_type} onChange={(e) => this.setAttr("e_type", e)}>
          {ufoaMeta.entityTypes.map(et => <option key={et}>{et}</option>)}
        </select>
      </div>);
  }

  renderEntityName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.ufoaEntity2.e_name} onChange={(e) => this.setAttr("e_name", e)} rows="5" cols="30"/>
      </div>);
  }

  // AssocPane ----------------------------------------------- 

  renderEntity(e: UfoaEntity) {
    return (
      <div className="entity-box" style={{backgroundColor: ufoaMeta.entityColor(e)}}>
        {ufoaMeta.entityTypeStr(e)}
        <br/>
        {e.e_name}
      </div>);
  }

  renderConnection(a: Association, c: Connection, align: string) {
    const prefix =
      R.equals(a.a_connection1, c) ?
        a.a_type === "member of" ?
          !a.a_connection1.mult.upper || a.a_connection1.mult.upper > 1 ? "\u2662" : "\u2666"
        : ""
      : ""
    return (
      <div className="col-xs-6" style={{textAlign: align}}>
        <span style={{fontSize: "22px"}}>{align === "left" ? prefix : ""}</span>
        {c.mult.lower}..{c.mult.upper ? c.mult.upper : "*"}
        <span style={{fontSize: "22px"}}>{align === "right" ? prefix : ""}</span>
      </div>
    );
  }

  renderAssocDetails(a: Association, c1: Connection, c2: Connection) {
    return (
      <div className="container-fluid nopadding">
        <div className="row" style={{textAlign: "center"}}>
          {ufoaMeta.assocTypeStr(a.a_type)} 
        </div>
        <div className="row" style={{textAlign: "center"}}>
          {a.a_label} 
        </div>
        <div className="row nopadding" style={{borderTop: "1px solid gray"}}>
        </div>
        <div className="row">
          <div className="container-fluid nopadding">
            <div className="row nopadding">
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
        <div className="row clickable" style={{marginBottom: "15px"}} key={assoc.a_id}
          onClick={(e) => associationDialog.render(assoc, this.props.ufoaVisModel)}>
          <div className="col-xs-4 nopadding">
            {e1 ? this.renderEntity(e1) : ""}
          </div>
          <div className="col-xs-4 nopadding">
            {this.renderAssocDetails(assoc, c1, c2)}
          </div>
          <div className="col-xs-4 nopadding">
            {e2 ? this.renderEntity(e2) : ""}
          </div>
        </div>
      );
    }
  }

  renderAssocPane() {
    return ( 
      <Panel>
        <Panel.Heading>Associations</Panel.Heading>
        <Panel.Body collapsible={false}>
          <div className="container-fluid">
            {ufoaDB.getAssocsOfEntity(this.props.ufoaEntity).map(this.renderAssoc)}
          </div>
        </Panel.Body>
      </Panel>);
  }
  // --------------------------------------------------------

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update entity</Button>
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
        body={`Are you sure you want to delete "${ufoaMeta.entityNameLine(this.props.ufoaEntity)}"?`}
        confirmText="Confirm Delete"
        title="Deleting Entity">
        <Button className="btn-danger">Delete entity</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>{this.props.ufoaEntity.e_name}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderEntityType()}
          {this.renderEntityName()}
          {this.renderAssocPane()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

  componentDidMount() {
    panels.fitPanes();
  }
}

export function render(ufoaEntity: UfoaEntity, ufoaVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<UfoaNodeForm ufoaEntity={ufoaEntity} ufoaVisModel={ufoaVisModel}/>, panel);
    panels.showDialog();
  }
}

