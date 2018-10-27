//@flow

import type { Id } from '../metamodel/ufoa';
import * as ufoaDB from '../db/ufoa';
import type { VisModel } from '../rendering';
import * as entityDialog from "./ufoa/entityDialog";
import * as panels from './panels';
import * as generalisationDialog from "./ufoa/generalisationDialog";
import * as associationDialog from "./ufoa/associationDialog";

export function fitPanes() {
  const wh = $(window).innerHeight();
  const ww = $(".tab-content").innerWidth();
  const fh = $("footer").height();
  const nh = $("nav").height();
  const th = $(".nav-tabs").height();
  const h = wh - fh - nh - th;

  $("#ufob-box").height(h);
  $("#ufoa-inst-box").height(h);
  $("#ufoa-box").height(h);
}

function dispatchNode(nodeId: Id, ufoaVisModel: VisModel) {
  let ufoaEntity = ufoaDB.getEntity(nodeId);
  if (!ufoaEntity) {
    console.error("Consistency error: entity e_id=" + nodeId + " not found in the UFO-A model"); 
  } else {
    entityDialog.render(ufoaEntity, ufoaVisModel);
  }
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
      console.error("ui/ui.handleClick: invalid edge type " + edge.type + " appeared in the UFO-A graph.");
      break;
  }
}

export function handleClick(ufoaVisModel: VisModel, params: any): void {
  let nodeId = params.nodes[0];
  let edgeId = params.edges[0];
  panels.hideDialog();
  if (nodeId) {
    dispatchNode(nodeId, ufoaVisModel);
  } else if (edgeId) {
    dispatchEdge(edgeId, ufoaVisModel);
  }
}

