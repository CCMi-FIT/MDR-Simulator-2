//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { VisModel } from '../rendering';
import { Button, Panel } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import * as scenarioInfoModal from './scenarioInfoModal';
import * as panels from '../panels';
import type { Id } from '../../metamodel/general';
import type { Scenario, Model } from '../../metamodel/scenario';
import * as scenarioDB from  '../../db/scenario';

type Props = {
  model: Model,
  ufobVisModel: VisModel
};

type State = {
  model: Model,
  openScenario: ?Scenario,
};

class ScenarioBox extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      model: props.model,
      openScenario: null,
    };
  }

  loadModel = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      scenarioDB.loadModel().then(
        model => {
          this.setState((state: State) => R.mergeDeepRight(state, { model }));
          resolve();
        },
        error => {
          panels.displayError("Failed loading scenarios: " + error);
          reject();
        }
      );
    });
  }

  newScenario = () => {
    scenarioDB.newScenario().then(
      newSc => {
        this.loadModel().then(
          () => this.setState({ openScenario: newSc })
        );
      },
      error => panels.displayError(error)
    );
  }

  loadScenario = (scId: Id) => {
    const sc = scenarioDB.getScenarioById(scId);
    if (sc) {
      this.setState({ openScenario: sc });
    }
  }

  renderScenariosSelect = () => {
    const oSc = this.state.openScenario;
    const options = R.concat(
      [{sc_id: "empty",
        sc_name: "--Select scenario--",
        sc_desc: "",
        sc_ev_insts: []
      }],
      this.state.model);
    return (
      <div style={{float: "left"}}>
        <select
          className="form-control"
          value={oSc ? oSc.sc_id : ""}
          onChange={evt => this.loadScenario(evt.currentTarget.value)}
        >
          {options.map(sc => <option key={sc.sc_id} value={sc.sc_id}>{sc.sc_name}</option>)}
        </select>
      </div>
    );
  }

  renderToolbar = () => {
    return (
      <div style={{paddingTop: "5px", paddingBottom: "5px"}}>
        <div className="btn-group" style={{marginRight: "5px"}} role="group">
          {this.renderScenariosSelect()}
        </div>
        <div className="btn-group" role="group">
          <Button className="btn-default" onClick={() => this.newScenario()}>New</Button>
        </div>
      </div>
    );
  }

  editInfo = () => {
    const sc = this.state.openScenario;
    if (sc) {
      scenarioInfoModal.render(sc).then(
        newSc => {
          scenarioDB.updateScenario(newSc).then(
            () => { 
              this.setState((state: State) => R.mergeDeepRight(state, { openScenario: newSc })); 
            }
          );
        }
      );
    }
  }

  delete = () => {
    if (this.state.openScenario) {
      scenarioDB.deleteScenario(this.state.openScenario.sc_id).then(
        () => {
          this.loadModel().then(
            () => {
              this.setState({ openScenario: null });
              panels.displayInfo("Scenario deleted.");
            }
          );
        },
        error => panels.displayError("Scenario delete failed: " + error));
    }
  }

  renderButtonDelete() {
    const scName = this.state.openScenario ? this.state.openScenario.sc_name : "";
    return (
      <Confirm
        onConfirm={this.delete}
        body={`Are you sure you want to delete "${scName}"?`}
        confirmText="Confirm Delete"
        title="Deleting Scenario"
      >
        <Button className="btn-danger btn-sm"><i className="glyphicon glyphicon-trash"/></Button>
      </Confirm>);
  }

  renderEditor = () => {
    const scName = this.state.openScenario ? this.state.openScenario.sc_name : "";
    return (
      <Panel>
        <Panel.Heading>
          <span style={{marginRight: "5px"}}>{scName}</span>
          <div className="btn-group" style={{marginLeft: "5px"}} role="group">
            <Button className="btn-primary btn-sm" onClick={() => this.editInfo()}>
              <i className="glyphicon glyphicon-pencil"/>
            </Button>
          </div>
          <div className="btn-group" style={{marginLeft: "5px"}} role="group">
            {this.renderButtonDelete()}
          </div>
        </Panel.Heading>
        <Panel.Body collapsible={false}>
        </Panel.Body>
      </Panel>
    );
  }

  render() {
    return ( 
      <div className="container-fluid nopadding">
        {this.renderToolbar()}
        {this.state.openScenario ? this.renderEditor() : null}
      </div>
    );
  }

}

export function render(model: Model, ufobVisModel: VisModel) {
  let box = panels.getScenariosBox();
  if (box) {
    ReactDOM.render(<ScenarioBox model={model} ufobVisModel={ufobVisModel}/>, box);
  }
}


