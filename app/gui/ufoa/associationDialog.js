// @flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Id, Name, Lower, Upper, Mult, AssocType, AssocMeta, Association,  Model } from '../../metamodel/ufoa';
import * as ufoaMeta from '../../metamodel/ufoa';
import * as ufoaDB from '../../db/ufoa';
import type { VisModel } from '../../rendering.js';
import * as panels from '../panels';

type Props = {
  association: Association,
  visModel: VisModel
};

type State = {
  association2: Association,
  showMeta: boolean,
  saveDisabled: boolean
};

function commitAssociation(edges: any, a: Association) {
  ufoaDB.updateAssociation(a).then((response) => {
    edges.update({ 
      id: a.a_id,
      from: a.a_connection1.e_id,
      to: a.a_connection2.e_id,
      label: a.a_label,
      title: ufoaMeta.assocStr(a), 
    });
    panels.hideDialog();
    panels.displayInfo("Association saved.");
  }, (error) => panels.displayError("Association save failed: " + error));
}
  
class AssociationForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      association2: props.association,
      showMeta: props.association.a_type === "member of",
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let val = event.currentTarget.value;
    this.setState((state, props) => {
      let aOrig = props.association;
      let stateNew;
      switch (attr) {
        case "a_type":
          this.setState({ showMeta: val === "member of" });
          stateNew = R.mergeDeepRight(state, { association2: { a_type: val }});
          break;
        case "a_meta":
          stateNew = R.mergeDeepRight(state, { association2: { a_meta: val }});
          break;
        case "a_label":
          stateNew = R.mergeDeepRight(state, { association2: { a_label: val }});
          break;
        default: 
          stateNew = R.mergeDeepRight(state, {});
          console.error(`AssociationForm: setAttr of ${attr} not implemented`);
      }
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(aOrig, stateNew.association2) });
    });
  }

  save = (event) => {
    let aOriginal = this.props.association;
    let aNew = this.state.association2;
    let edges: any = this.props.visModel.edges;
    if (!R.equals(aOriginal, aNew)) {
      commitAssociation(edges, aNew);
    }
  };

  delete = (event) => {
    let edges: any = this.props.visModel.edges;
    let a_id = this.props.association.a_id;
    ufoaDB.deleteAssociation(a_id).then((response) => {
      edges.remove({ id: a_id });
      panels.hideDialog();
      panels.displayInfo("Association deleted.");
    }, (error) => panels.displayError("Association delete failed: " + error));
  }

  renderType() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Type</label>
        <div className="col-sm-10">
          <select className="form-control" value={this.state.association2.a_type} onChange={(ev) => this.setAttr("a_type", ev)}>
            {ufoaMeta.assocTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>);
  }

  renderMeta() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Meta</label>
        <div className="col-sm-10">
          <select className="form-control" value={this.state.association2.a_meta} onChange={(ev) => this.setAttr("a_meta", ev)}>
            {ufoaMeta.assocMetas.map(meta => <option key={meta}>{meta}</option>)}
          </select>
        </div>
      </div>);
  }

  renderLabel() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Label</label>
        <div className="col-sm-10">
          <textarea className="form-control" type="text" value={this.state.association2.a_label} onChange={(e) => this.setAttr("a_label", e)} rows="2" cols="30"/>
        </div>
      </div>);
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6 text-center"> 
          <Button className="btn-default" onClick={this.save} disabled={this.state.saveDisabled}>Update</Button>
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
        body={`Are you sure you want to delete "${this.props.association.a_id}"?`}
        confirmText="Confirm Delete"
        title="Deleting Association">
        <Button className="btn-danger">Delete Association</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>{`Association ${this.props.association.a_id}`}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderType()}
          {this.state.showMeta ? this.renderMeta() : null }
          {this.renderLabel()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }
}

export function render(association: Association, ufoaVisModel: VisModel) {
  let container = panels.getContainer();
  if (container) {
    ReactDOM.render(<AssociationForm association={association} visModel={ufoaVisModel}/>, container);
    panels.showDialog();
  }
}

