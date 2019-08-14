//@flow

import type { Id } from '../../metamodel';
import * as ufobDB from '../db';
import type { VisModel } from '../../diagram';
import * as situationDialog from './dialogs/situationDialog';
import * as eventDialog from './dialogs/eventDialog';

function dispatchNode(nodeId: Id, ufobVisModel: VisModel) {
  let node = ufobVisModel.nodes.get(nodeId);
  switch (node.type) {
    case "situation":
      let s = ufobDB.getSituationById(nodeId);
      if (!s) {
        console.error("Consistency error: situation s_id=" + nodeId + " not found in the UFO-B model"); 
      } else {
        situationDialog.render(s, ufobVisModel);
      }
      break;
    case "event":
      let ev = ufobDB.getUfobEventById(nodeId);
      if (!ev) {
        console.error("Consistency error: event ev_id=" + nodeId + " not found in the UFO-B model"); 
      } else {
        eventDialog.render(ev, ufobVisModel);
      }
      break;
    default:
      console.error("Invalid node type " + node.type + " appeared in the UFO-B graph.");
  }
}

function dispatchEdge(edgeId: Id, ufobVisModel: VisModel) {
  // currently ignore
}

export function handleClick(ufobVisModel: VisModel, params: any): void {
  let nodeId = params.nodes[0];
  let edgeId = params.edges[0];
  if (nodeId) {
    dispatchNode(nodeId, ufobVisModel);
  } else if (edgeId) {
    dispatchEdge(edgeId, ufobVisModel);
  }
}

