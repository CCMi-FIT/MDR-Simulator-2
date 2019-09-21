import { Id } from "../../metamodel";
import { Position } from "../../diagram";
import * as ufoaDB from "../db";
import { UfoaVisModel } from "./diagram";
import * as panels from "../../panels";
import * as entityDialog from "./dialogs/entityDialog";
import * as generalisationDialog from "./dialogs/generalisationDialog";
import * as associationDialog from "./dialogs/associationDialog";

var clickPos: Position | undefined;

export function getClickPos(): Position | undefined {
  return clickPos;
}

function dispatchNode(nodeId: Id, ufoaVisModel: UfoaVisModel) {
  const ufoaEntity = ufoaDB.getEntity(nodeId);
  entityDialog.render(ufoaEntity, ufoaVisModel);
}

function dispatchEdge(edgeId: Id, ufoaVisModel: UfoaVisModel) {
  const edge = ufoaVisModel.edges.get(edgeId);
  if (edge) {
    switch (edge.type) {
      case "generalisation":
	const generalisation = ufoaDB.getGeneralisation(edgeId);
	if (!generalisation) {
	  console.error(new Error("Consistency error: generalisation g_id=" + edgeId + " not found in the UFO-A model"));
	} else {
	  generalisationDialog.render(generalisation, ufoaVisModel);
	}
	break;
      case "association":
	const association = ufoaDB.getAssociation(edgeId);
	if (!association) {
	  console.error(new Error("Consistency error: association a_id=" + edgeId + " not found in the UFO-A model"));
	} else {
	  associationDialog.render(association, ufoaVisModel);
	}
	break;
      default:
	console.error(new Error("Invalid edge type " + edge.type + " appeared in the UFO-A graph."));
	break;
    }
  } else {
    throw(new Error("ufoa.dispatchEdge: edge not found id=" + edgeId));
  }
}

function dispatchNone() {
  panels.disposeDialogUfoa();
}

export function handleClick(ufoaVisModel: UfoaVisModel, params: any): void {
  clickPos = params.pointer.canvas;
  const nodeId = params.nodes[0];
  const edgeId = params.edges[0];
  if (nodeId) {
    dispatchNode(nodeId, ufoaVisModel);
  } else if (edgeId) {
    dispatchEdge(edgeId, ufoaVisModel);
  } else {
    dispatchNone();
  }
}
