//@flow

import NanoEvents from 'nanoevents';
import type { Id } from '../../metamodel';
import type { VisModel } from '../../diagram';
import * as ufobDB from '../../ufob/db';
import * as diagram from './diagram';
import * as panels from '../../panels';

var ufoBDiagramEmmiter = new NanoEvents();

export function addUfoBDiagramClickHandler(handler: any) {
  ufoBDiagramEmmiter.on("ufobClick", handler);
}

async function handleEvent(evId: Id, machine: any, ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any) {
  let ev = ufobDB.getUfobEventById(evId);               
  if (ev) {
    $(`#${panels.wmdaTitleId}`).html(ev.ev_name);
    $(`#${panels.wmdaPanelId}`).html(ev.ev_wmda_text);
  } else {
    console.error(`Inconsistency: event ${evId} not present in the model`);
  }
  if (machine.isInPresent()) {
    await diagram.doStep(machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, evId);
    ufoBDiagramEmmiter.emit("ufobClick");
  } else {
    panels.displayError("You are currently viewing a non-last state. Move to it first to make the transition.");
  }
}

function handleSituation(sId: Id) {
  let s = ufobDB.getSituationById(sId);               
  if (s) {
    $(`#${panels.wmdaTitleId}`).html(s.s_name);
    $(`#${panels.wmdaPanelId}`).html(s.s_wmda_text);
  } else {
    console.error(`Inconsistency: situation${sId} not present in the model`);
  }
}

export function dispatchUfoBDiagramClick(machine: any, ufobVisModel: VisModel, simUfobNetwork: any,  ufoaInstVisModel: VisModel, ufoaInstNetwork: any, params: any) {
  const nodeId = params.nodes[0];
  if (nodeId) {
    const node = ufobVisModel.nodes.get(nodeId);
    if (node.type === "event") {
      handleEvent(nodeId, machine, ufobVisModel, ufoaInstVisModel, ufoaInstNetwork);
    } else { // situation ... hopefully
      if (node.type === "situation") {
        handleSituation(nodeId);
      } else {
        console.error("Unknown UFO-B diagram node type: " + node.type);
      }
    }
  }
}

