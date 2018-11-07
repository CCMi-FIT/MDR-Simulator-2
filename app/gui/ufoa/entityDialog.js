//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { UfoaEntity } from '../../metamodel/ufoa';
import * as ufoaMeta from '../../metamodel/ufoa';
import * as ufoaDB from '../../db/ufoa';
import type { VisModel } from '../../rendering.js';
import * as panels from '../panels';

type Props = {
  ufoaEntity: UfoaEntity,
  visModel: VisModel
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
    let nodes: any = this.props.visModel.nodes;
    if (!R.equals(ufoaEntityOriginal, ufoaEntityNew)) {
      commitEntity(nodes, ufoaEntityNew);
    }
  };

  delete = (event) => {
    let nodes: any = this.props.visModel.nodes;
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
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }
}

export function render(ufoaEntity: UfoaEntity, ufoaVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<UfoaNodeForm ufoaEntity={ufoaEntity} visModel={ufoaVisModel}/>, panel);
    panels.showDialog();
  }
}

