//@flow

import NanoEvents from 'nanoevents';
import type { Id } from '../../metamodel';
import type { VisModel } from '../../diagram';

var ufoBDiagramEmmiter = new NanoEvents();
const EVENT_CLICK = "eventClick";
const SITUATION_CLICK = "situationClick";
const UNSELECTED = "unselected";
const DRAG_START = "dragStart";
const ZOOM = "zoom";

// Event handlers {{{1
export function addEventClickHandler(handler: (Id) => void) {
  ufoBDiagramEmmiter.on(EVENT_CLICK, (evId: Id) => handler(evId));
}

export function addSituationClickHandler(handler: (Id) => void) {
  ufoBDiagramEmmiter.on(SITUATION_CLICK, (sId: Id) => handler(sId));
}

export function addUnselectHandler(handler: () => void) {
  ufoBDiagramEmmiter.on(UNSELECTED, handler);
}

export function addDragStartHandler(handler: () => void) {
  ufoBDiagramEmmiter.on(DRAG_START, handler);
}

export function addZoomHandler(handler: () => void) {
  ufoBDiagramEmmiter.on(ZOOM, handler);
}

// Registering functions {{{1

function dispatchUfoBDiagramClick(ufobVisModel: VisModel, params: any) {
  const nodeId = params.nodes[0];
  if (nodeId) {
    const node = ufobVisModel.nodes.get(nodeId);
    if (node.type === "event") {
      ufoBDiagramEmmiter.emit(EVENT_CLICK, nodeId);
    } else { // situation ... hopefully
      if (node.type === "situation") {
        ufoBDiagramEmmiter.emit(SITUATION_CLICK, nodeId);
      } else {
        console.error(new Error("Unknown UFO-B diagram node type: " + node.type);
      }
    }
  } else {
    ufoBDiagramEmmiter.emit(UNSELECTED);
  }
}
export function registerHandlers(ufobVisModel: VisModel, simUfobNetwork: any) {
  simUfobNetwork.on("click", params => dispatchUfoBDiagramClick(ufobVisModel, params));
  simUfobNetwork.on("dragStart", () => ufoBDiagramEmmiter.emit(DRAG_START));
  simUfobNetwork.on("zoom", () => ufoBDiagramEmmiter.emit(ZOOM));
}


