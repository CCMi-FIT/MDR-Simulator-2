// @flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel } from '../../../components';
import { Confirm } from 'react-confirm-bootstrap';
import type { Association } from '../../../ufoa/metamodel';
import * as ufoaMeta from '../../../ufoa/metamodel';
import * as ufoaDB from '../../../ufoa/db';
import type { VisModel } from '../../../diagram';
import * as panels from '../../../panels';

// Props & State {{{1
type Props = {
  association: Association,
  visModel: VisModel
};

type State = {
  association2: Association,
  showMeta: boolean,
  saveDisabled: boolean
};
//}}}1

function commitAssociation(edges: any, a: Association) {
  ufoaDB.updateAssociation(a).then(
    () => {
      edges.update({ 
        id: a.a_id,
        from: a.a_connection1.e_id,
        to: a.a_connection2.e_id,
        label: a.a_label,
        title: ufoaMeta.assocStr(a), 
        arrows: {
          from: {
            enabled: a.a_type === "MemberOf",
            type: "circle"
          }
        }
      });
      panels.disposeDialog();
      panels.displayInfo("Association saved.");
    },
    error => panels.displayError("Association save failed: " + error)
  );
}

// Component {{{1
class AssociationForm extends panels.PaneDialog<Props, State> {

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

// Operations {{{1
  setAttr = (attr: string, val: any) => {
    this.setState((state: State, props: Props) => {
      let stateCopy = Object.assign({}, state); // Just because Flow bitches about state in R.dissocPath
      let aOrig = props.association;
      let stateNew = 
          attr === "a_type" ?
            R.mergeDeepRight(state, {
              showMeta: val === "member of",
             association2: { a_type: val }
            }) 
        : attr === "a_meta" ?
          R.mergeDeepRight(state, { association2: { a_meta: val }})
        : attr === "a_connection1.mult.lower" ? 
          R.mergeDeepRight(state, { association2: { a_connection1: { mult: { lower: !val || val < 0 ? 0 : parseInt(val, 10)}}}})
        : attr === "a_connection1.mult.upper" ? (
            val ? R.mergeDeepRight(state, { association2: { a_connection1: { mult: { upper: parseInt(val, 10)}}}})
                : R.dissocPath(["association2", "a_connection1", "mult", "upper"], stateCopy)
          )
        : attr === "a_connection2.mult.lower" ? 
          R.mergeDeepRight(state, { association2: { a_connection2: { mult: { lower: !val || val < 0 ? 0 :parseInt(val,10)}}}})
        : attr === "a_connection2.mult.upper" ? (
            val ? R.mergeDeepRight(state, { association2: { a_connection2: { mult: { upper: parseInt(val, 10)}}}})
                : R.dissocPath(["association2", "a_connection2", "mult", "upper"], stateCopy)
          )
        : attr === "a_label" ?
          R.mergeDeepRight(state, { association2: { a_label: val }})
        : (() => {
            console.error(`AssociationForm: setAttr of ${attr} not implemented`);
            return R.mergeDeepRight(state, {});
          })();
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(aOrig, stateNew.association2) });
    });
  }

  save = () => {
    let aOriginal = this.props.association;
    let aNew = this.state.association2;
    let edges: any = this.props.visModel.edges;
    if (!R.equals(aOriginal, aNew)) {
      commitAssociation(edges, aNew);
    }
  };

  delete = () => {
    let edges: any = this.props.visModel.edges;
    let a_id = this.props.association.a_id;
    ufoaDB.deleteAssociation(a_id).then(
      () => {
        edges.remove({ id: a_id });
        panels.disposeDialog();
        panels.displayInfo("Association deleted.");
      },
      error => panels.displayError("Association delete failed: " + error)
    );
  }

  // Rendering {{{1

  renderType() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Type</label>
        <div className="col-sm-10">
          <select className="form-control" value={this.state.association2.a_type} onChange={(e) => this.setAttr("a_type", e.currentTarget.value)}>
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
          <select className="form-control" value={this.state.association2.a_meta} onChange={(e) => this.setAttr("a_meta", e.currentTarget.value)}>
            {ufoaMeta.assocMetas.map(meta => <option key={meta}>{meta}</option>)}
          </select>
        </div>
      </div>);
  }

  renderMultiplicity(connection: string) {
    const e = ufoaDB.getEntity(this.state.association2[connection].e_id);
    const upper = this.state.association2[connection].mult.upper;
    if (!e) { 
      return (<span>Internal error: entity not found</span>);
    } else {
      return (
        <Panel heading={<span><strong>{ufoaMeta.entityNameLine(e)}</strong></span>}>
          <div className="row">
            <div className="col-sm-5">
              <input className="form-control" 
                type="number"
                value={this.state.association2[connection].mult.lower}
                onChange={(e) => this.setAttr(`${connection}.mult.lower`, e.currentTarget.value)}
              />
            </div>
            <div className="col-sm-1">..</div>
            <div className="col-sm-5">
              <input className="form-control"
                type="number"
                value={upper ? upper : ""}
                onChange={(e) => this.setAttr(`${connection}.mult.upper`, e.currentTarget.value)}
              />
            </div>
          </div>
        </Panel>);
    }
  }

  renderMultiplicities() {
    return (
      <div className="form-group row">
        <div className="col-sm-6">
          {this.renderMultiplicity("a_connection1")}
        </div>
        <div className="col-sm-6">
          {this.renderMultiplicity("a_connection2")}
        </div>
      </div>);
  }
    
  renderLabel() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Label</label>
        <div className="col-sm-10">
          <textarea className="form-control" type="text" value={this.state.association2.a_label} onChange={(e) => this.setAttr("a_label", e.currentTarget.value)} rows="2" cols="30"/>
        </div>
      </div>);
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6 text-center"> 
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update</button>
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
        <button type="button" className="btn btn-danger">Delete Association</button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel heading={<span>Association <strong>{this.props.association.a_id}</strong></span>}>
      {this.renderType()}
      {this.state.showMeta ? this.renderMeta() : null }
      {this.renderMultiplicities()}
      {this.renderLabel()}
      {this.renderButtons()}
    </Panel>
    );
  }
}

///}}}1
export function render(association: Association, ufoaVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<AssociationForm association={association} visModel={ufoaVisModel}/>, panel);
    panels.showDialog();
  }
}

