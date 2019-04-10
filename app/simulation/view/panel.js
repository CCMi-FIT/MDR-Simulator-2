// @flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Split from 'react-split';
import * as panels from '../../panels';
import * as ufobDiagram from '../../ufob/view/diagram';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import type { VisModel } from '../../diagram';
import { dispatch } from './dispatch.js';

type Props = {};
type State = {
  selectedView: "instances" | "wmda";
};

class SimulationBox extends panels.PaneDialog<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedView: "instances"
    };
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-offset-7 col-xs-2">
            <input 
              type="radio"
              name="sim-view"
              checked={this.state.selectedView === "instances"}
              onChange={() => this.setState({selectedView: "instances"})}
            />
            <label htmlFor="insts-view">Instances</label>
          </div>
          <div className="col-xs-2">
            <input 
              type="radio"
              name="sim-view"
              checked={this.state.selectedView === "wmda"}
              onChange={() => this.setState({selectedView: "wmda"})}
            />
            <label htmlFor="wmda-view">WMDA standard</label>
          </div>
        </div>
        <div className="row">
          <Split direction="horizontal" sizes={[50, 50]}>
            <div style={{float: "left", borderRight: "1px solid lightgray"}}>
              <div id="simulation-diagram"></div>
            </div>
            <div style={{float: "left", paddingRight: 0}}>
              <div id="ufoa-inst-diagram" style={{display: (this.state.selectedView === "instances" ? "block" : "none")}}></div>
              <div id="wmda-panel" style={{display: (this.state.selectedView === "wmda" ? "block" : "none"), overflowY: "auto"}}></div>
            </div>
          </Split>
        </div>
      </div>
    );
  }
}

export function render(machine: any, ufobVisModel: VisModel) {
  let panel = panels.getSimulationBox();
  ReactDOM.render(<SimulationBox/>, panel);
  const ufoaInstDiagramContainer = panels.getInstDiagram();
  const simUfobDiagramContainer = panels.getUfobDiagram();
  let ufoaInstVisModel = ufoaInstDiagram.newVis();
  let ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
  let simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
  simUfobNetwork.setOptions({ manipulation: false });
  simUfobNetwork.on("click", params => dispatch(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, params));
  simUfobNetwork.fit({ 
    nodes: ["ev40"],
    animation: false
  });
}

