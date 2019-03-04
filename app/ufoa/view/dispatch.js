//@flow

import type { Id } from '../../metamodel';
import * as ufoaDB from '../db';
import type { VisModel } from '../../diagram';
import * as entityDialog from './dialogs/entityDialog';
import * as panels from '../../panels';
import * as generalisationDialog from "./dialogs/generalisationDialog";
import * as associationDialog from "./dialogs/associationDialog";

function dispatchNode(nodeId: Id, ufoaVisModel: VisModel) {
  let ufoaEntity = ufoaDB.getEntity(nodeId);
  entityDialog.render(ufoaEntity, ufoaVisModel);
}

function dispatchEdge(edgeId: Id, ufoaVisModel: VisModel) {
  let edge = ufoaVisModel.edges.get(edgeId);
  switch (edge.type) {
    case "generalisation": 
      let generalisation = ufoaDB.getGeneralisation(edgeId);
      if (!generalisation) {
        console.error("Consistency error: generalisation g_id=" + edgeId + " not found in the UFO-A model"); 
      } else {
        generalisationDialog.render(generalisation, ufoaVisModel);
      }
      break; 
    case "association": 
      let association = ufoaDB.getAssociation(edgeId);
      if (!association) {
        console.error("Consistency error: association a_id=" + edgeId + " not found in the UFO-A model"); 
      } else {
        associationDialog.render(association, ufoaVisModel);
      }
      break; 
    default:
      console.error("Invalid edge type " + edge.type + " appeared in the UFO-A graph.");
      break;
  }
}

export function handleClick(ufoaVisModel: VisModel, params: any): void {
  let nodeId = params.nodes[0];
  let edgeId = params.edges[0];
  panels.disposeDialog();
  if (nodeId) {
    dispatchNode(nodeId, ufoaVisModel);
  } else if (edgeId) {
    dispatchEdge(edgeId, ufoaVisModel);
  }
}

