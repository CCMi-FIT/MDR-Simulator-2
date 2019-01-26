//@flow

import * as vis from 'vis';
import type { EntityInst } from '../../ufoa-inst/metamodel';
import * as ufoaDB from '../../ufoa/db';
import * as ufoaMeta from '../../ufoa/metamodel';
import * as ufoaInstMeta from '../../ufoa-inst/metamodel';
import type { VisNode, VisModel } from '../../diagram';

export function newVis(): VisModel {
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

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
