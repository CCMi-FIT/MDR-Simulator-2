//@flow

import type { VisModel } from '../../diagram';
import * as ufobDB from '../../ufob/db';
import * as diagram from './diagram';
import * as panels from '../../panels';

export function dispatchClick(machine: any, ufobVisModel: VisModel, simUfobNetwork: any,  ufoaInstVisModel: VisModel, ufoaInstNetwork: any, params: any) {
  const nodeId = params.nodes[0];
  if (nodeId) {
    const node = ufobVisModel.nodes.get(nodeId);
    if (node.type === "event") {
      let ev = ufobDB.getUfobEventById(nodeId);               
      if (ev) {
        $(`#${panels.wmdaTitleId}`).html(ev.ev_name);
        $(`#${panels.wmdaPanelId}`).html(ev.ev_wmda_text);
      } else {
        console.error(`Inconsistency: event ${nodeId} not present in the model`);
      }
      diagram.doStep(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, nodeId);
    } else { // situation ... hopefully
      if (node.type === "situation") {
        let s = ufobDB.getSituationById(nodeId);               
        if (s) {
          $(`#${panels.wmdaTitleId}`).html(s.s_name);
          $(`#${panels.wmdaPanelId}`).html(s.s_wmda_text);
        } else {
          console.error(`Inconsistency: situation${nodeId} not present in the model`);
        }
      } else {
        console.error("Unknown UFO-B diagram node type: " + node.type);
      }
    }
  }
}

