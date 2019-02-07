//@flow

import * as R from 'ramda';
import * as vis from 'vis';
import type { EntityInst, GeneralisationInst, AssocInst } from '../../ufoa-inst/metamodel';
import * as ufoaDB from '../../ufoa/db';
import type { Generalisation, Association } from '../../ufoa/metamodel';
import * as ufoaMeta from '../../ufoa/metamodel';
import * as ufoaDiagram from '../../ufoa/view/diagram';
import * as ufoaInstMeta from '../../ufoa-inst/metamodel';
import type { VisNode, VisEdge, VisModel } from '../../diagram';

export function newVis(): VisModel {
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

// Entity Inst {{{1

function eiColor(ei: EntityInst): string {
  const entity = ufoaDB.getEntity(ei.ei_e_id);
  return entity ? ufoaMeta.entityColor(entity) : "#FFFFFF";
}

function entityInst2vis(ei: EntityInst): VisNode {
  return ({
    id: ufoaInstMeta.eiId(ei),
    label: ufoaInstMeta.eiLabel(ei, ufoaDB),
    shape: "box",
    color: eiColor(ei)
  });
}

export function addEntityInst(visModel: VisModel, ei: EntityInst) {
  const newNode = entityInst2vis(ei);
  visModel.nodes.add(newNode);
}

// Generalisation Inst {{{1

export function gInst2vis(gi: GeneralisationInst): VisEdge {
  return ({
    id: gi.gi_id,
    type: "genInst",
    from: gi.gi_sup_ei_id,
    to: gi.gi_sub_ei_id,
    arrows: "from",
    width: 5,
    smooth: false
  });
}

// Association Inst {{{1

export function assocInst2vis(ai: AssocInst): ?VisEdge {
  const a = ufoaDB.getAssociation(ai.ai_a_id);
  if (a) {
    return ({
      id: ai.ai_id,
      type: "assocInst",
      from: ai.ai_ei1_id,
      to: ai.ai_ei2_id,
      arrows: {
        from: {
          enabled: a.a_type === "member of",
          type: "circle"
        }
      },
      width: 2,
      smooth: false
    });
  } else {
    console.error(`Model inconsistency: Association ${ai.ai_a_id} in AssocInst ${ai.ai_id} does not exist`);
    return null;
  }
}

// Render {{{1

export function renderUfoaInst(container: HTMLElement, visModel: VisModel): any {
  let visNetwork;
  const options = {
    edges: {
      smooth: false
    },
    //layout: {
      //hierarchical: {
        //enabled: true,
        //sortMethod: "directed"
      //}
    //},
    physics: {
      enabled: true,
      solver: "barnesHut",
      barnesHut: {
        gravitationalConstant: -500,
        centralGravity: 0,
        springLength: 50,
        springConstant: 0,
        damping: 0.3,
        avoidOverlap: 1
      },
    },
    //interaction: {
      //multiselect: true
    //},
    //manipulation: {
      //enabled: true,
      //addNode: (nodeData, callback) => addNodeHandler(ufobVisModel, visNetwork, nodeData, callback),
      ////addEdge: (edgeData, callback) => addEdgeHandler(ufobVisModel, edgeData, callback)
    //}
  };
  
  visNetwork = new vis.Network(container, visModel, options);
  return visNetwork;
}
