//@flow

import * as vis from 'vis';
import type { EntityInst, GeneralisationInst, AssocInst } from '../../ufoa-inst/metamodel';
import * as ufoaDB from '../../ufoa/db';
import * as ufoaMeta from '../../ufoa/metamodel';
import * as ufoaInstMeta from '../../ufoa-inst/metamodel';
import type { VisNode, VisEdge, VisModel } from '../../diagram';

// Initialisation {{{1

export function newVis(): VisModel {
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

// General manipulation {{{1

export function addEdge(visModel: VisModel, edge: any) {
  let visEdges = visModel.edges;
  if (!visEdges.get(edge.id)) {
    visEdges.add(edge);
  }
}

export function addEdges(visModel: VisModel, edges: Array<any>) {
  edges.map(edge => addEdge(edge));
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

export function addEntityInsts(visModel: VisModel, eis: Array<EntityInst>) {
  eis.map(ei => addEntityInst(visModel, ei));
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

export function addGInst(visModel: VisModel, gi: GeneralisationInst) {
  const newEdge = gInst2vis(gi);
  addEdge(visModel, newEdge);
}

export function addGInsts(visModel: VisModel, gis: Array<GeneralisationInst>) {
  gis.map(gi => addGInst(visModel, gi));
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

export function addAInst(visModel: VisModel, ai: AssocInst) {
  const newEdge = assocInst2vis(ai);
  addEdge(visModel, newEdge);
}

export function addAInsts(visModel: VisModel, ais: Array<AssocInst>) {
  ais.map(ai => addAInst(visModel, ai));
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
