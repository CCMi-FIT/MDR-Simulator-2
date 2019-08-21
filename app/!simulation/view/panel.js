// @flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import { Tabs, Tab } from '../../components';
import type { Id } from '../../metamodel.js';
import type { Situation } from '../../ufob/metamodel';
import * as ufobDB from '../../ufob/db';
import * as diagram from '../../diagram';
import * as simDiagram from './diagram';
import { cloneVisModel } from '../../diagram';
import * as machine from './../machine';
import * as panels from '../../panels';
import * as ufobDiagram from '../../ufob/view/diagram';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import type { VisModel } from '../../diagram';
import * as dispatch from './dispatch';


// Decls {{{1

type Props = { };
type State = {
  showTimeline: boolean,
  fireButtonPos: {left: number, top: number},
  fireButtonVisible: boolean,
  eventToFire: ?Id
};

var ufobVisModel: any = null;
var ufobVisModelOrig: any = null;
var simUfobNetwork: any = null;
var ufoaInstVisModel: any = null;
var ufoaInstNetwork: any = null;

// Handling {{{1

function setWmdaTab(heading: string, body: string) {
  $(`#${panels.wmdaTitleId}`).html(heading);
  $(`#${panels.wmdaPanelId}`).html(body);
}

// Component {{{1

class SimulationBox extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      showTimeline: false,
      fireButtonPos: {left: 0, top: 0},
      fireButtonVisible: false,
      eventToFire: null
    };
    dispatch.addEventClickHandler(this.clickEventEv);
    dispatch.addSituationClickHandler(this.clickSituationEv);
    dispatch.addUnselectHandler(this.hideFireButton);
    dispatch.addDragStartHandler(this.hideFireButton);    
    dispatch.addZoomHandler(this.hideFireButton);    
  }


  // Events {{{2

  showFireButton = (evId: Id) => {
    const bb = diagram.getBoundingBox(simUfobNetwork, evId);
    const height = bb.bottom - bb.top;
    const fbPos = { left: bb.right, top: bb.top + (height / 2) + 20};
    this.setState({ fireButtonPos: fbPos, fireButtonVisible: true, eventToFire: evId });
  }

  clickEventEv = (evId: Id) => {
    this.showFireButton(evId);
    let ev = ufobDB.getUfobEventById(evId);               
    if (ev) {
      setWmdaTab(ev.ev_name, ev.ev_wmda_text);
    } else {
      console.error(new Error(`Inconsistency: event ${evId} not present in the model`);
    }
  }

  clickSituationEv = (sId: Id) => {
    let s = ufobDB.getSituationById(sId);               
    if (s) {
      setWmdaTab(s.s_name, s.s_wmda_text);
    } else {
      throw(`Inconsistency: situation${sId} not present in the model`);
    }
  }

  // Actions {{{2
  hideFireButton = () => {
    this.setState({ fireButtonVisible: false, eventToFire: null });
    simUfobNetwork.unselectAll();
  }

  fireEvent = () => {
    if (machine.isInPresent()) {
      const evId = this.state.eventToFire;
      if (evId) {
        simDiagram.doStep(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, evId);
      } else {
        throw("eventToFire is null, this should not happen");
      }
    } else {
      panels.displayError("You are currently viewing a non-last state. Move to it first to make the transition.");
    }
  }

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
      console.error(new Error("moveToCurrent(): non-existent event instance found");
    } else {
      // $FlowFixMe
      simDiagram.colorise(ufobVisModel, machine);
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
            //TODO
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

  renderFireButton = () => {
    return (
      this.state.fireButtonVisible ? 
      (<button 
      id="fire-button"
      type="button"
      className="btn btn-danger"
      data-toggle="tooltip" data-placement="right" title="Play event"
      style={{
        position: "absolute",
        left: this.state.fireButtonPos.left,
        top: this.state.fireButtonPos.top,
        width: "40px",
        height: "40px",
        padding: "6px",
        fontSize: "12px",
        borderRadius: "50%"}}
      onClick={this.fireEvent}>
        <i className="fas fa-play"></i>
      </button>)
      : ""
    );
  }

  renderSimulationPane() {
    return (
      <div>
        {this.renderSimulationToolbar()}
        {this.renderTimeline()}
        <div id={panels.simUfobDiagramId}></div>
        {this.renderFireButton()}
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
              <h2 id={panels.wmdaTitleId}></h2> {/*Populated by dispatch.setWmdaTab()*/}
              <div id={panels.wmdaPanelId} style={{ paddingTop: "10px" }}></div> {/*Populated by dispatch.setWmdaTab()*/}
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
      dispatch.registerHandlers(ufobVisModel, simUfobNetwork);
      simUfobNetwork.fit();
    }
  }
}



