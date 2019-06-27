// @flow

// Imports {{{1
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Split from 'react-split';
import * as panels from '../../panels';
import * as ufobDiagram from '../../ufob/view/diagram';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import type { VisModel } from '../../diagram';
import { dispatch } from './dispatch.js';
import { Button, Tabs, Tab } from "react-bootstrap";

// Decls {{{1

type Props = { };
type State = {
  selectedView: "instances" | "wmda";
};

var ufoaInstNetwork = null;

// Component {{{1

class SimulationBox extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedView: "instances"
    };
  }

  // Rendering {{{2

  // Simulation Pane {{{3
  renderSimulationPane() {
    return (
      <div style={{float: "left", borderRight: "1px solid lightgray"}}>
        <div id="simulation-diagram"></div>
      </div>
    );
  }

  // Details Pane {{{3
  renderDetailsPane() {
    return (
      <div style={{float: "left", paddingRight: 0}}>
        <Tabs defaultActiveKey="profile" id="simulation-details-tabs">
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
      <div style={{ paddingTop: "10px" }}>
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
            <div id="wmda-panel" style={{ paddingTop: "10px" }}></div>
          </div>
        </div>
      </Tab>
    );
  }
  // }}}4

  render() {
    return (
      <div className="container-fluid">
        <Split direction="horizontal" sizes={[50, 50]}>
          {this.renderSimulationPane()}
          {this.renderDetailsPane()}
        </Split>
      </div>
    );
  }

  // }}}3
  // }}}2
}
// }}}1

export function render(machine: any, ufobVisModel: VisModel) {
  let panel = panels.getSimulationBox();
  ReactDOM.render(<SimulationBox/>, panel);
  const ufoaInstDiagramContainer = panels.getInstDiagram();
  const simUfobDiagramContainer = panels.getUfobDiagram();
  let ufoaInstVisModel = ufoaInstDiagram.newVis();
  ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
  let simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
  simUfobNetwork.setOptions({ manipulation: false });
  simUfobNetwork.on("click", params => dispatch(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, params));
  simUfobNetwork.fit();
  // simUfobNetwork.fit({
  //   nodes: ["ev40"],
  //   animation: false
  // })
}

