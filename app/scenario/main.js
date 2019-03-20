// @flow

import type { VisModel } from '../diagram';
import * as ufobDiagram from "../ufob/view/diagram";
import * as machine from './machine';
import * as ufoaInstDiagram from '../ufoa-inst/view/diagram';
import * as ufobDB from '../ufob/db';
import * as panels from '../panels';
import { doStep } from './view/diagram';

function dispatch(ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, params: any) {
  const nodeId = params.nodes[0];
  if (nodeId) {
    const node = ufobVisModel.nodes.get(nodeId);
    let wmdaText = "";
    if (node.type === "event") {
      let ev = ufobDB.getUfobEventById(nodeId);               
      if (ev) {
        wmdaText = ev.ev_wmda_text;
      } else {
        console.error(`Inconsistency: event ${nodeId} not present in the model`);
      }
      if (!machine.isValid()) {
        panels.displayError("Simulation crashed, please restart it");
      } else {
        doStep(ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, nodeId);
      }
    } else { // situation ... hopefully
      if (node.type === "situation") {
        let s = ufobDB.getSituationById(nodeId);               
        if (s) {
          wmdaText = s.s_wmda_text;
        } else {
          console.error(`Inconsistency: situation${nodeId} not present in the model`);
        }
      } else {
        console.error("Unknown UFO-B diagram node type: " + node.type);
      }
    }
    $('#wmda-panel').html(wmdaText);
  }
}

export function initialise(ufobVisModel: any) {
  const ufoaInstDiagramContainer = document.getElementById('ufoa-inst-diagram');
  const simUfobDiagramContainer = document.getElementById('simulation-diagram');
  if (ufoaInstDiagramContainer) {
    let ufoaInstVisModel = ufoaInstDiagram.newVis();
    let ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
    if (simUfobDiagramContainer) {
      machine.initialize();
      let simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
      simUfobNetwork.setOptions({ manipulation: false });
      simUfobNetwork.on("click", params => dispatch(ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, params));
      simUfobNetwork.fit({ 
        nodes: ["ev40"],
        animation: false
      });
    } else {
      console.error('#simulation-diagram missing in DOM');
    }
  } else {
    console.error('#ufoa-inst-diagram missing in DOM');
  }
}



