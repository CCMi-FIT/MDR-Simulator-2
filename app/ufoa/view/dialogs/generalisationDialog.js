// @flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Generalisation } from '../../metamodel';
import * as ufoaMeta from '../../metamodel';
import * as ufoaDB from '../../db';
import type { VisModel } from '../../../diagram';
import * as panels from '../../../panels';

type Props = {
  generalisation: Generalisation,
  visModel: VisModel
};

type State = {
  generalisation2: Generalisation,
  saveDisabled: boolean
};

function commitGeneralisation(edges: any, g: Generalisation) {
  ufoaDB.updateGeneralisation(g).then(
    () => {
      edges.update({ 
        id: g.g_id,
        label: g.g_set.g_set_id,
        from: g.g_sup_e_id,
        to: g.g_sub_e_id,
      });
      panels.disposeDialog();
      panels.displayInfo("Generalisation saved.");
    },
    error => panels.displayError("Generalisation save failed: " + error)
  );
}
  
class GeneralisationsForm extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      generalisation2: props.generalisation,
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, val: any) => {
    this.setState((state, props) => {
      let gOrig = props.generalisation;
      let stateNew;
      switch (attr) {
        case "g_set.g_set_id":
          let newGSet = ufoaDB.getGSet(val);
          if (newGSet) {
            stateNew = R.mergeDeepRight(state, {
              generalisation2: {
                g_set: newGSet 
              }
            });
          } else { // new g_set_id
            stateNew = R.mergeDeepRight(state, { 
              generalisation2: { 
                g_set: {
                  g_set_id: val,
                  g_meta: ""
                }
              }
            });
          }
          break;
        case "g_set.g_meta":
          stateNew = R.mergeDeepRight(state, { generalisation2: { g_set: { g_meta: val }}});
          break;
        case "g_sup_e_id":
          stateNew = R.mergeDeepRight(state, { generalisation2: { g_sup_e_id: val}});
          break;
        case "g_sub_e_id":
          stateNew = R.mergeDeepRight(state, { generalisation2: { g_sub_e_id: val}});
          break;
        default: 
          stateNew = R.mergeDeepRight(state, {});
          console.error(`GeneralisationForm: setAttr of ${attr} not implemented`);
      }
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(gOrig, stateNew.generalisation2) });
    });
  }

  save = () => {
    let gOriginal = this.props.generalisation;
    let gNew = this.state.generalisation2;
    let edges: any = this.props.visModel.edges;
    if (!R.equals(gOriginal, gNew)) {
      commitGeneralisation(edges, gNew);
    }
  };
  
  delete = () => {
    let edges: any = this.props.visModel.edges;
    let g_id = this.props.generalisation.g_id;
    ufoaDB.deleteGeneralisation(g_id).then(
      () => {
        edges.remove({ id: g_id });
        panels.disposeDialog();
        panels.displayInfo("Generalisation deleted.");
      },
      error => panels.displayError("Generalisation delete failed: " + error)
    );
  }

  renderGSet() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Set</label>
        <div className="col-sm-10">
          <Typeahead
            id="gsetTA"
            options={ufoaDB.getGeneralisationSets()}
            labelKey={"g_set_id"}
            onChange={gSets => { 
              if (gSets.length) { 
                this.setAttr("g_set.g_set_id", gSets[0].g_set_id); 
              }
            }}
            selected={[this.state.generalisation2.g_set]}
            allowNew={true}
          />
        </div>
      </div>);
  }

  renderMeta() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Meta</label>
        <div className="col-sm-10">
          <select className="form-control" value={this.state.generalisation2.g_set.g_meta} onChange={(e) => this.setAttr("g_set.g_meta", e.currentTarget.value)}>
            {ufoaMeta.genMetas.map(meta => <option key={meta}>{meta}</option>)}
          </select>
        </div>
      </div>);
  }

  renderSup() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Supertype</label>
        <div className="col-sm-10">
          <Typeahead
            id="supTA"
            options={ufoaDB.getEntities()}
            labelKey={(e) => ufoaMeta.entityNameLine(e)}
            selected={[ufoaDB.getEntity(this.state.generalisation2.g_sup_e_id)]}
            onChange={(entities) => {
              if (entities.length) {
                this.setAttr("g_sup_e_id", entities[0].e_id);
              }
            }}
          />
        </div>
      </div>);
  }

  renderSub() {
    return (
      <div className="form-group row">
          <label className="col-sm-2 col-form-label">Subtype</label>
        <div className="col-sm-10">
          <Typeahead
            id="subTA"
            options={ufoaDB.getEntities()}
            labelKey={(e) => ufoaMeta.entityNameLine(e)}
            selected={[ufoaDB.getEntity(this.state.generalisation2.g_sub_e_id)]}
            onChange={(entities) => {
              if (entities.length) {
                this.setAttr("g_sub_e_id", entities[0].e_id);
              }
            }}
          />
        </div>
      </div>);
  }
  
  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6 text-center"> 
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update</Button>
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
        body={`Are you sure you want to delete "${this.props.generalisation.g_id}"?`}
        confirmText="Confirm Delete"
        title="Deleting Generalisation">
        <Button className="btn-danger">Delete Generalisation</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog-panel">
        <Panel.Heading><strong>Generalisation</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderGSet()}
          {this.renderMeta()}
          {this.renderSup()}
          {this.renderSub()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }
}

export function render(generalisation: Generalisation, ufoaVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<GeneralisationsForm generalisation={generalisation} visModel={ufoaVisModel}/>, panel);
    panels.showDialog();
  }
}

