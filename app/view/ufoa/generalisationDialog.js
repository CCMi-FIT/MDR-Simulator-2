// @flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Generalisation } from '../../metamodel/ufoa';
import * as ufoaMeta from '../../metamodel/ufoa';
import * as ufoaDB from '../../db/ufoa';
import type { VisModel } from './canvas/rendering';
import * as panels from '../panels';

type Props = {
  generalisation: Generalisation,
  visModel: VisModel
};

type State = {
  generalisation2: Generalisation,
  saveDisabled: boolean
};

function commitGeneralisation(edges: any, g: Generalisation) {
  ufoaDB.updateGeneralisation(g).then((response) => {
    edges.update({ 
      id: g.g_id,
      label: g.g_set.g_set_id,
      from: g.g_sup_e_id,
      to: g.g_sub_e_id,
    });
    panels.hideDialog();
    panels.displayInfo("Generalisation saved.");
  }, (error) => panels.displayError("Generalisation save failed: " + error));
}
  
class GeneralisationsForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      generalisation2: props.generalisation,
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  setAttr = (attr: string, event: any) => {
    let val = event.currentTarget.value;
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

  save = (event) => {
    let gOriginal = this.props.generalisation;
    let gNew = this.state.generalisation2;
    let edges: any = this.props.visModel.edges;
    if (!R.equals(gOriginal, gNew)) {
      commitGeneralisation(edges, gNew);
    }
  };
  
  delete = (event) => {
    let edges: any = this.props.visModel.edges;
    let g_id = this.props.generalisation.g_id;
    ufoaDB.deleteGeneralisation(g_id).then((response) => {
      edges.remove({ id: g_id });
      panels.hideDialog();
      panels.displayInfo("Generalisation deleted.");
    }, (error) => panels.displayError("Generalisation delete failed: " + error));
  }

  renderGSet() {
    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Set</label>
        <div className="col-sm-10">
          <Typeahead
            options={ufoaDB.getGeneralisationSets()}
            labelKey={"g_set_id"}
            onChange={gSets => { 
              if (gSets.length) { 
                this.setAttr("g_set.g_set_id", { currentTarget: { value: gSets[0].g_set_id }}); 
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
          <select className="form-control" value={this.state.generalisation2.g_set.g_meta} onChange={(ev) => this.setAttr("g_set.g_meta", ev)}>
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
            options={ufoaDB.getEntities()}
            labelKey={(e) => ufoaMeta.entityNameLine(e)}
            selected={[ufoaDB.getEntity(this.state.generalisation2.g_sup_e_id)]}
            onChange={(entities) => {
              if (entities.length) {
                this.setAttr("g_sup_e_id", { currentTarget: { value: entities[0].e_id }});
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
            options={ufoaDB.getEntities()}
            labelKey={(e) => ufoaMeta.entityNameLine(e)}
            selected={[ufoaDB.getEntity(this.state.generalisation2.g_sub_e_id)]}
            onChange={(entities) => {
              if (entities.length) {
                this.setAttr("g_sub_e_id", { currentTarget: { value: entities[0].e_id }});
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
        body={`Are you sure you want to delete "${this.props.generalisation.g_id}"?`}
        confirmText="Confirm Delete"
        title="Deleting Generalisation">
        <Button className="btn-danger">Delete Generalisation</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
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

