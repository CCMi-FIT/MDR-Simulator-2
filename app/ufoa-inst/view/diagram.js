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

export function gen2InstVis(g: Generalisation, supInst: EntityInst, subInst: EntityInst): any {
  const gInstEdge: VisEdge = ufoaDiagram.generalisation2vis(g);
  return R.dissoc('label',
    R.mergeDeepRight(gInstEdge, { 
      from: ufoaInstMeta.eiId(supInst),
      to: ufoaInstMeta.eiId(subInst) 
    }));
}

// Association Inst {{{1

export function assoc2InstVis(a: Association, e1Inst: EntityInst, e2Inst: EntityInst): any {
  const aInstEdge: VisEdge = ufoaDiagram.assoc2vis(a);
  return R.dissoc('label',
    R.mergeDeepRight(aInstEdge, { 
      from: ufoaInstMeta.eiId(e1Inst),
      to: ufoaInstMeta.eiId(e2Inst) 
    }));
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
