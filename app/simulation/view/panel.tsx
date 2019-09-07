// Imports {{{1
import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { Tabs, Tab } from "../../components";
import { Id } from "../../metamodel.js";
import { Situation, UfobEvent } from "../../ufob/metamodel";
import { UfobEventInst } from "../../ufob-inst/metamodel";
import * as ufobDB from "../../ufob/db";
import * as diagram from "../../diagram";
import { UfobVisModel } from "../../ufob/view/diagram";
import * as ufobDiagram from "../../ufob/view/diagram";
import * as simDiagram from "./diagram";
import * as machine from "./../machine";
import * as panels from "../../panels";
import * as ufoaInstDiagram from "../../ufoa-inst/view/diagram";
import * as dispatch from "./dispatch";


// Decls {{{1

interface State {
  showTimeline: boolean;
  fireButtonPos: {left: number; top: number};
  fireButtonVisible: boolean;
  eventToFire: Id | null;
}

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

class SimulationBox extends panels.PaneDialog<{}, State> {

  constructor() {
    super({});
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
  private showFireButton = (evId: Id) => {
    const bb = diagram.getBoundingBox(simUfobNetwork, evId);
    const height = bb.bottom - bb.top;
    const fbPos = { left: bb.right, top: bb.top + (height / 2) + 20};
    this.setState({ fireButtonPos: fbPos, fireButtonVisible: true, eventToFire: evId });
  }

  private clickEventEv = (evId: Id) => {
    this.showFireButton(evId);
    const ev = ufobDB.getUfobEventById(evId);
    if (ev) {
      setWmdaTab(ev.ev_name, ev.ev_wmda_text);
    } else {
      console.error(new Error(`Inconsistency: event ${evId} not present in the model`));
    }
  }

  private clickSituationEv = (sId: Id) => {
    const s = ufobDB.getSituationById(sId);
    if (s) {
      setWmdaTab(s.s_name, s.s_wmda_text);
    } else {
      throw(new Error(`Inconsistency: situation${sId} not present in the model`));
    }
  }

  // Actions {{{2
  private hideFireButton = () => {
    this.setState({ fireButtonVisible: false, eventToFire: null });
    simUfobNetwork.unselectAll();
  }

  private fireEvent = () => {
    if (machine.isInPresent()) {
      const evId = this.state.eventToFire;
      if (evId) {
        simDiagram.doStep(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, evId);
      } else {
        throw(new Error("eventToFire is null, this should not happen"));
      }
    } else {
      panels.displayError("You are currently viewing a non-last state. Move to it first to make the transition.");
    }
  }

  private switchCurrentSituation = (s: Situation) => {
    ufoaInstVisModel = ufoaInstDiagram.newUfoaInstVisModel();
    const ufoaInstDiagramContainer = panels.getSimInstDiagram();
    if (ufoaInstDiagramContainer) {
      ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
    }
    machine.switchCurrentSituation(s);
    ufoaInstDiagram.addEntityInsts(ufoaInstVisModel, machine.getEntityInsts());
    ufoaInstDiagram.addAInsts(ufoaInstVisModel, machine.getAInsts());
    ufoaInstDiagram.addGInsts(ufoaInstVisModel, machine.getGInsts());
  }

  private moveToCurrent = () => {
    machine.moveToCurrent();
    simDiagram.colorise(ufobVisModel, machine);
    this.forceUpdate(); // timeline has changed
  }

  // Rendering {{{2
  // Simulation Pane {{{3
  // Timeline {{{4
  private renderSituation = (s: Situation) => {
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
                    <i className="fas fa-plane"/>
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

  private renderTimeline = () => {
    return (
      this.state.showTimeline ? (
        <div className="events-log-panel">
          <div className="card">
            {machine.getPastSituations().map(this.renderSituation)}
          </div>
        </div>
      ) : ""
    );
  }

  private renderSimulationToolbar = () => {
    return (
      <div className="toolbar">
        <div className="btn-group" role="group">
          <button
          type="button"
          className="btn btn-secondary"
          data-toggle="tooltip" data-placement="bottom" title="Show/hide timeline"
          onClick={() => this.setState(
            (state: State) => ({ ...state,  showTimeline: !state.showTimeline })
          )}>
            <i className="fas fa-history"/>
          </button>
          <button
          type="button"
          className="btn btn-secondary"
          data-toggle="tooltip" data-placement="bottom" title="Restart simulator"
          onClick={() => { initialize(ufobVisModelOrig); }}>
            <i className="fas fa-power-off"/>
          </button>
        </div>
      </div>
    );
  }

  private renderFireButton = () => {
    return (
      this.state.fireButtonVisible ? (
        <button
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
          <i className="fas fa-play"/>
        </button>
      ) : ""
    );
  }

  private renderSimulationPane = () => {
    return (
      <div>
        {this.renderSimulationToolbar()}
        {this.renderTimeline()}
        <div id={panels.simUfobDiagramId}/>
        {this.renderFireButton()}
      </div>
    );
  }

  // Details Pane {{{3
  private renderDetailsPane = () => {
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
  private renderInstancesTab = () => {
    return (
      <Tab tabId="instances" title="Instances">
        {this.renderInstToolbar()}
        <div id={panels.simInstDiagramId}/>
      </Tab>
    );
  }

  private renderInstToolbar = () => {
    return (
      <div className="toolbar">
        <button
        type="button"
        className="btn btn-secondary"
        data-toggle="tooltip" data-placement="bottom" title="Stop Layouting"
        onClick={() => ufoaInstNetwork ? ufoaInstNetwork.stopSimulation() : void 0}>
          <i className="fas fa-stop-circle"/>
        </button>
      </div>
    );
  }
  // }}}4
  // WMDA Tab {{{4
  private renderWmdaTab = () => {
    return (
      <Tab tabId="wmdaStandard" title="WMDA Standard">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h2 id={panels.wmdaTitleId}/> {/*Populated by dispatch.setWmdaTab()*/}
              <div id={panels.wmdaPanelId} style={{ paddingTop: "10px" }}/> {/*Populated by dispatch.setWmdaTab()*/}
            </div>
          </div>
        </div>
      </Tab>
    );
  }
  // }}}2

  public render = () => {
    return (
      <SplitPane split="vertical" minSize={100} defaultSize={500}>
        {this.renderSimulationPane()}
        {this.renderDetailsPane()}
      </SplitPane>
    );
  }

}
// }}}1

export function initialize(ufobVisModel1: UfobVisModel) {
  machine.initialize();
  ufobVisModelOrig = ufobDiagram.cloneUfobVisModel(ufobVisModel1);
  ufobVisModel = ufobDiagram.cloneUfobVisModel(ufobVisModel1);
  const panel = panels.getSimulationBox();
  if (panel) {
    ReactDOM.render(<SimulationBox/>, panel);
    const simUfobDiagramContainer = panels.getSimUfobDiagram();
    const ufoaInstDiagramContainer = panels.getSimInstDiagram();
    if (simUfobDiagramContainer && ufoaInstDiagramContainer) {
      ufoaInstVisModel = ufoaInstDiagram.newUfoaInstVisModel();
      simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
      ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
      simUfobNetwork.setOptions({ manipulation: false });
      dispatch.registerHandlers(ufobVisModel, simUfobNetwork);
      simUfobNetwork.fit();
    }
  }
}
