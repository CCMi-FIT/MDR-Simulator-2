// @flow

import * as ufobDiagram from "../ufob/view/diagram";
import * as machine from './machine';
import * as ufoaInstDiagram from '../ufoa-inst/view/diagram';
import { dispatch } from './view/dispatch.js';

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



