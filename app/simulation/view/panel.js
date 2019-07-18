// @flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Split from 'react-split';
import type { UfobEventInst } from '../../ufob-inst/metamodel';
import * as ufobDB from '../../ufob/db';
import { cloneVisModel } from '../../diagram';
import * as machine from './../machine';
import * as panels from '../../panels';
import * as ufobDiagram from '../../ufob/view/diagram';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import type { VisModel } from '../../diagram';
import * as dispatch from './dispatch';
import { Button, Tabs, Tab } from "react-bootstrap";

//import { counter as Counter } from '../../purescript/Counter';

// Decls {{{1

type Props = { };
type State = {
  eventsLog: Array<UfobEventInst>,
  showEventsLog: bool
};

var ufobVisModel: any = null;
var ufobVisModelOrig: any = null;
var simUfobNetwork: any =null;
var ufoaInstNetwork: any = null;

// Component {{{1

class SimulationBox extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      eventsLog: [],
      showEventsLog: false
    };
    dispatch.addUfoBDiagramClickHandler(this.ufobDiagramClicked);
  }

  // Events {{{2
  ufobDiagramClicked = () => {
    this.state.eventsLog = machine.getEvents();
    this.forceUpdate();
  }

  // Rendering {{{2

  // Simulation Pane {{{3

  // Events Log {{{4

  renderEvent(evi: UfobEventInst) {
    const mev = ufobDB.getUfobEventById(evi.evi_ev_id);
    return (
      <div style={{display: "block"}} key={evi.evi_id}>
        <Button
          onClick={() => { 
            machine.switchCurrent(evi);
            this.forceUpdate();
          }}
        >
          {(() => {
            const label = mev ? mev.ev_name : "invalid ev_id";
            return (
              machine.isCurrentEv(evi) ?
              <strong>{label}</strong>
              : label);
          })()}
        </Button>
      </div>
    );
  }

  renderEventsLog() {
    return (
      this.state.showEventsLog ? 
        <div className="events-log-panel">
          { this.state.eventsLog.map(this.renderEvent) }
        </div>
      : <div className="events-log-panel"></div>
    );
  }

  renderSimulationToolbar() {
    return (
      <div className="toolbar">
        <Button 
          className="btn-primary"
          onClick={() => this.setState(
            (state: State) => R.mergeDeepRight(state, { showEventsLog: !state.showEventsLog })
          )}
        ><i className={"glyphicon " + (this.state.showEventsLog ? "glyphicon-option-vertical" : "glyphicon-option-horizontal")}></i>
        </Button>
        <Button
          className="btn-primary"
          onClick={() => { initialize(ufobVisModelOrig); }}>
          Reset
        </Button>
      </div>
    );
  }

  renderSimulationPane() {
    return (
      <div style={{float: "left", borderRight: "1px solid lightgray"}}>
        <div className="container-fluid">
          <div className="row">
            {this.renderSimulationToolbar()}
            {this.renderEventsLog()}
            <div id="simulation-diagram"></div>
          </div>
        </div>
      </div>
    );
  }

  // Details Pane {{{3
  renderDetailsPane() {
    return (
      <div style={{float: "left", paddingRight: 0}}>
        <Tabs defaultActiveKey="instances" id="simulation-details-tabs">
          {this.renderInstancesTab()}
          {this.renderWmdaTab()}
        </Tabs>
      </div>
    );
  }

  // Instances Tab {{{4
  renderInstancesTab() {
    return (
      <Tab eventKey="instances" title="Instances">
        <div className="container-fluid">
          <div className="row">
            {this.renderInstToolbar()}
            <div id="ufoa-inst-diagram"></div>
          </div>
        </div>
      </Tab>
    );
  }
  
  renderInstToolbar() {
    return (
      <div className="toolbar">
        <Button
          className="btn-primary"
          onClick={() => ufoaInstNetwork ? ufoaInstNetwork.stopSimulation() : void 0}>
          Stop Layouting
        </Button>
      </div>
    );
  }
  // }}}4 
  // WMDA Tab {{{4
  renderWmdaTab() {
    return (
      <Tab eventKey="wmdaStandard" title="WMDA Standard">
        <div className="container-fluid">
          <div className="row">
            <h2 id={panels.wmdaTitleId}></h2> {/*Populated by dispatch*/}
            <div id={panels.wmdaPanelId} style={{ paddingTop: "10px" }}></div> {/*Populated by dispatch*/}
          </div>
        </div>
      </Tab>
    );
  }
  // }}}2

  render() {
    return (
      <div className="container-fluid">
        <Split direction="horizontal" sizes={[50, 50]}>
          {this.renderSimulationPane()
          /* <Counter label="Counter"/> */}
          {this.renderDetailsPane()}
        </Split>
      </div>
    );
  }

}
// }}}1

export function initialize(ufobVisModel1: VisModel) {
  machine.initialize();
  ufobVisModelOrig = cloneVisModel(ufobVisModel1);
  ufobVisModel = cloneVisModel(ufobVisModel1);
  const panel = panels.getSimulationBox();
  ReactDOM.render(<SimulationBox/>, panel);
  const ufoaInstDiagramContainer = panels.getInstDiagram();
  const simUfobDiagramContainer = panels.getUfobDiagram();
  const ufoaInstVisModel = ufoaInstDiagram.newVis();
  ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
  simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
  simUfobNetwork.setOptions({ manipulation: false });
  simUfobNetwork.on("click", params => dispatch.dispatchUfoBDiagramClick(machine, ufobVisModel, simUfobNetwork, ufoaInstVisModel, ufoaInstNetwork, params));
  simUfobNetwork.fit();
}


