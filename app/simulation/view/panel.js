// @flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import { Tabs, Tab } from '../../components';
import type { UfobEventInst } from '../../ufob-inst/metamodel';
import * as ufobDB from '../../ufob/db';
import { cloneVisModel } from '../../diagram';
import * as machine from './../machine';
import * as panels from '../../panels';
import * as ufobDiagram from '../../ufob/view/diagram';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import type { VisModel } from '../../diagram';
import * as dispatch from './dispatch';

//import { counter as Counter } from '../../purescript/Counter';

// Decls {{{1

type Props = { };
type State = {
  eventsLog: Array<UfobEventInst>,
  showEventsLog: bool
};

var ufobVisModel: any = null;
var ufobVisModelOrig: any = null;
var simUfobNetwork: any = null;
var ufoaInstVisModel: any = null;
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

  // Actions {{{2
  switchEvent = (evi: UfobEventInst) => {
    ufoaInstVisModel = ufoaInstDiagram.newVis();
    const ufoaInstDiagramContainer = panels.getSimInstDiagram();
    if (ufoaInstDiagramContainer) {
      ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
    }
    machine.switchCurrent(evi);
    ufoaInstDiagram.addEntityInsts(ufoaInstVisModel, machine.getEntityInsts());
    ufoaInstDiagram.addAInsts(ufoaInstVisModel, machine.getAInsts());
    ufoaInstDiagram.addGInsts(ufoaInstVisModel, machine.getGInsts());
  }

  // Rendering {{{2

  // Simulation Pane {{{3

  // Events Log {{{4

  renderEvent = (evi: UfobEventInst) => {
    const mev = ufobDB.getUfobEventById(evi.evi_ev_id);
    return (
      <ul key={evi.evi_id} className="list-group list-group-flush">
        <li className="list-group-item clickable-log"
          onClick={() => { 
            this.switchEvent(evi);
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
        </li>
      </ul>
    );
  }

  renderEventsLog() {
    return (
      this.state.showEventsLog ? 
        <div className="events-log-panel">
          <div className="card">
            { this.state.eventsLog.map(this.renderEvent) }
          </div>
        </div>
      : "" 
    );
  }

  renderSimulationToolbar() {
    return (
      <div className="toolbar">
        <div className="btn-group" role="group">
          <button 
          type="button"
          className="btn btn-secondary"
          data-toggle="tooltip" data-placement="bottom" title="Show/hide timeline"
          onClick={() => this.setState(
            (state: State) => R.mergeDeepRight(state, { showEventsLog: !state.showEventsLog })
          )}>
            <i className="fas fa-history"></i>
          </button>
          <button
          type="button"
          className="btn btn-secondary"
          data-toggle="tooltip" data-placement="bottom" title="Restart simulator"
          onClick={() => { initialize(ufobVisModelOrig); }}>
            <i className="fas fa-power-off"></i>
          </button>
        </div>
      </div>
    );
  }

  renderSimulationPane() {
    return (
      <div>
        {this.renderSimulationToolbar()}
        {this.renderEventsLog()}
        <div id={panels.simUfobDiagramId}></div>
      </div>
    );
  }

  // Details Pane {{{3
  renderDetailsPane() {
    return (
      <div>
        <Tabs activeTab="instances" id="simulation-details-tabs">
          {this.renderInstancesTab()}
          {this.renderWmdaTab()}
        </Tabs>
      </div>
    );
  }

  // Instances Tab {{{4
  renderInstancesTab() {
    return (
      <Tab tabId="instances" title="Instances">
        {this.renderInstToolbar()}
        <div id={panels.simInstDiagramId}></div>
      </Tab>
    );
  }
  
  renderInstToolbar() {
    return (
      <div className="toolbar">
        <button
        type="button"
        className="btn btn-secondary"
        data-toggle="tooltip" data-placement="bottom" title="Stop Layouting"
        onClick={() => ufoaInstNetwork ? ufoaInstNetwork.stopSimulation() : void 0}>
          <i className="fas fa-stop-circle"></i>
        </button>
      </div>
    );
  }
  // }}}4 
  // WMDA Tab {{{4
  renderWmdaTab() {
    return (
      <Tab tabId="wmdaStandard" title="WMDA Standard">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h2 id={panels.wmdaTitleId}></h2> {/*Populated by dispatch*/}
              <div id={panels.wmdaPanelId} style={{ paddingTop: "10px" }}></div> {/*Populated by dispatch*/}
            </div>
          </div>
        </div>
      </Tab>
    );
  }
  // }}}2

  render() {
    return (
      <SplitPane split="vertical" minSize={100} defaultSize={500}>
        {this.renderSimulationPane()}
        {this.renderDetailsPane()}
      </SplitPane>
    );
  }

}
// }}}1

export function initialize(ufobVisModel1: VisModel) {
  machine.initialize();
  ufobVisModelOrig = cloneVisModel(ufobVisModel1);
  ufobVisModel = cloneVisModel(ufobVisModel1);
  const panel = panels.getSimulationBox();
  if (panel) { 
    ReactDOM.render(<SimulationBox/>, panel);
    const simUfobDiagramContainer = panels.getSimUfobDiagram();
    const ufoaInstDiagramContainer = panels.getSimInstDiagram();
    if (simUfobDiagramContainer && ufoaInstDiagramContainer) {
      ufoaInstVisModel = ufoaInstDiagram.newVis();
      simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
      ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
      simUfobNetwork.setOptions({ manipulation: false });
      simUfobNetwork.on("click", params => dispatch.dispatchUfoBDiagramClick(machine, ufobVisModel, simUfobNetwork, ufoaInstVisModel, ufoaInstNetwork, params));
      simUfobNetwork.fit();
    }
  }
}



