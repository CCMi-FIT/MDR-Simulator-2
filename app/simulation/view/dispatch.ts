import NanoEvents from "nanoevents";
import { Id } from "../../metamodel";
import { UfobVisModel, UfobVisNode } from "../../ufob/view/diagram";

const ufoBDiagramEmmiter = new NanoEvents();
const EVENT_CLICK: string = "eventClick";
const SITUATION_CLICK: string = "situationClick";
const UNSELECTED: string = "unselected";
const DRAG_START: string = "dragStart";
const ZOOM: string = "zoom";

// Event handlers {{{1
export function addEventClickHandler(handler: (evId: Id) => void) {
  ufoBDiagramEmmiter.on(EVENT_CLICK, (evId: Id) => handler(evId));
}

export function addSituationClickHandler(handler: (evId: Id) => void) {
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

function dispatchUfoBDiagramClick(ufobVisModel: UfobVisModel, params: any) {
  const nodeId: Id | null = params.nodes ? params.nodes[0] : null;
  if (nodeId) {
    const node: UfobVisNode | null = ufobVisModel.nodes.get(nodeId);
    if (node) {
      if (node.type === "event") {
	ufoBDiagramEmmiter.emit(EVENT_CLICK, nodeId);
      } else { // situation ... hopefully
	if (node.type === "situation") {
	  ufoBDiagramEmmiter.emit(SITUATION_CLICK, nodeId);
	} else {
	  console.error(new Error("Unknown UFO-B diagram node type: " + node.type));
	}
      }
    }
  } else {
    ufoBDiagramEmmiter.emit(UNSELECTED);
  }
}
export function registerHandlers(ufobVisModel: UfobVisModel, simUfobNetwork: any) {
  simUfobNetwork.on("click", (params: any) => dispatchUfoBDiagramClick(ufobVisModel, params));
  simUfobNetwork.on("dragStart", () => ufoBDiagramEmmiter.emit(DRAG_START));
  simUfobNetwork.on("zoom", () => ufoBDiagramEmmiter.emit(ZOOM));
}
