//@flow

import type { VisModel } from '../../diagram.js';
import * as ufobDB from '../../ufob/db';
import { doStep } from './diagram';

export function dispatch(ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, params: any) {
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
      doStep(ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, nodeId);
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

