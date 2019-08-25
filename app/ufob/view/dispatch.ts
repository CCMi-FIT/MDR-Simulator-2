import { Id } from "../../metamodel";
import * as ufobDB from "../db";
import { UfobVisModel } from "../../ufob/view/diagram";
import * as situationDialog from "./dialogs/situationDialog";
import * as eventDialog from "./dialogs/eventDialog";

function dispatchNode(nodeId: Id, ufobVisModel: UfobVisModel) {
  const node = ufobVisModel.nodes.get(nodeId);
  if (node) {
    switch (node.type) {
      case "situation":
        const s = ufobDB.getSituationById(nodeId);
        if (!s) {
          console.error(new Error("Consistency error: situation s_id=" + nodeId + " not found in the UFO-B model"));
        } else {
          situationDialog.render(s, ufobVisModel);
        }
        break;
      case "event":
        const ev = ufobDB.getUfobEventById(nodeId);
        if (!ev) {
          console.error(new Error("Consistency error: event ev_id=" + nodeId + " not found in the UFO-B model"));
        } else {
          eventDialog.render(ev, ufobVisModel);
        }
        break;
      default:
        console.error(new Error("Invalid node type " + node.type + " appeared in the UFO-B graph."));
    }
  } else {
    console.error(new Error("Node not present: " + nodeId));
  }
}

function dispatchEdge(edgeId: Id, ufobVisModel: UfobVisModel) {
  // currently ignore
}

export function handleClick(ufobVisModel: UfobVisModel, params: any): void {
  const nodeId = params.nodes[0];
  const edgeId = params.edges[0];
  if (nodeId) {
    dispatchNode(nodeId, ufobVisModel);
  } else if (edgeId) {
    dispatchEdge(edgeId, ufobVisModel);
  }
}
