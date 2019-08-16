// @flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import { Tabs, Tab } from '../../components';
import type { Situation } from '../../ufob/metamodel';
import type { UfobEventInst } from '../../ufob-inst/metamodel';
import * as ufobDB from '../../ufob/db';
import * as diagram from './diagram';
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
  showTimeline: bool
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
      showTimeline: false
    };
    dispatch.addUfoBDiagramClickHandler(this.ufobDiagramClicked);
  }

  // Events {{{2
  ufobDiagramClicked = () => {
    this.forceUpdate();
  }

  // Actions {{{2
  switchCurrentSituation = (s: Situation) => {
    ufoaInstVisModel = ufoaInstDiagram.newVis();
    const ufoaInstDiagramContainer = panels.getSimInstDiagram();
    if (ufoaInstDiagramContainer) {
      ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
    }
    machine.switchCurrentSituation(s);
    ufoaInstDiagram.addEntityInsts(ufoaInstVisModel, machine.getEntityInsts());
    ufoaInstDiagram.addAInsts(ufoaInstVisModel, machine.getAInsts());
    ufoaInstDiagram.addGInsts(ufoaInstVisModel, machine.getGInsts());
  }

  moveToCurrent = () => {
    const removedEvis = machine.moveToCurrent();
    const removedEvs = removedEvis.map(evi => ufobDB.getUfobEventById(evi.evi_ev_id));
    if (removedEvs.includes(null)) {
      console.error("moveToCurrent(): non-existent event instance found");
    } else {
      // $FlowFixMe
      diagram.colorise(ufobVisModel, machine);
    }
    this.forceUpdate();
  }

  // Rendering {{{2
  // Simulation Pane {{{3
  // Timeline {{{4
  renderSituation = (s: Situation) => {
    const mLast = machine.getLastSituation();
    const isLast = mLast ? mLast.s_id === s.s_id : false;
    const isCurrent = machine.getCurrentSituation().s_id === s.s_id;
    return (
      <ul key={s.s_id} className="list-group list-group-flush">
        <li className={"list-group-item pr-0 pt-0 pb-0" + (!isCurrent ? " clickable-log" : "")}
          onClick={() => { 
            this.switchCurrentSituation(s);
            this.forceUpdate();
          }}
        >
          {(() => {
            return (
              <div className="d-flex flex-row align-items-center">
                <div>
                  {isCurrent ? <strong>{s.s_name}</strong> : s.s_name}
                </div>
                {isCurrent && !isLast ? 
                  (<div className="ml-auto">
                    <button 
                    type="button"
                    className="btn btn-light"
                    data-toggle="tooltip" data-placement="right" title="Move to this state"
                    onClick={() => this.moveToCurrent()}>
                      <i className="fas fa-plane"></i>
                    </button>
                  </div>)
                  : ""
                }
              </div>
            );
          })()}
        </li>
      </ul>
    );
  }

  renderTimeline() {
    return (
      this.state.showTimeline ? 
        <div className="events-log-panel">
          <div className="card">
            { machine.getPastSituations().map(this.renderSituation) }
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
            (state: State) => R.mergeDeepRight(state, { showTimeline: !state.showTimeline })
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
        {this.renderTimeline()}
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



